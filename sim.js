/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById('particle-life');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const types = ['BLUE', 'RED', 'GREEN'];

const attractionMatrix = {
    'BLUE': {'BLUE': 1.0, 'RED': 1.0, 'GREEN': 1.0},
    'RED': {['BLUE']: 1.0, 'RED': 1.0, 'GREEN': 1.0},
    'GREEN': {'BLUE': 1.0, 'RED': 1.0, 'GREEN': 1.0}
};
const repulsionMatrix = {
    'BLUE': {'BLUE': 15, 'RED': 15, 'GREEN': 15},
    'RED': {'BLUE': 15, 'RED': 15, 'GREEN': 15},
    'GREEN': {'BLUE': 15, 'RED': 15, 'GREEN': 15}
};
const typeColors = {
    'BLUE': '#41b9ffb3',
    'RED': '#ee0c0cb3',
    'GREEN': '#0ecc08b3'
};
    

const minRadius = 0;
const maxRadius = 400;
const friction = 0.95;
const force = 0.5;
const particleRadius = 5;


let currentMode = 'add';
/** @type {HTMLSelectElement}*/
const particleSelector = document.getElementById('particle-selector');
let isDragging = false;
let draggedParticles = null;

let particles = [];

const forceButton = document.getElementById('toggle-force-table');
const forceTable = document.getElementById('force-table');

const repelButton = document.getElementById('toggle-repel-table');
const repelTable = document.getElementById('repel-table');

document.getElementById('mode-add').addEventListener('click', (e) => {
    setActiveMode('add', e.currentTarget);
    repelTable.hidden = true;
    forceTable.hidden = true;
});
document.getElementById('mode-remove').addEventListener('click', (e) => {
    setActiveMode('remove', e.currentTarget)
    repelTable.hidden = true;
    forceTable.hidden = true;
});
document.getElementById('mode-move').addEventListener('click', (e) => {
    setActiveMode('move', e.currentTarget)
    repelTable.hidden = true;
    forceTable.hidden = true;
});
document.getElementById('clear').addEventListener('click', (e) => {
    particles = [];
});
let paused = false;
const pauseButton = document.getElementById('pause');
pauseButton.addEventListener('click', (e) => {
    paused = !paused;
    if (paused) {
        pauseButton.textContent = 'Unpause';
    } else {
        pauseButton.textContent = 'Pause'
    }
});

function findParticlesAt(mouseX, mouseY, radiusThreshold = 20) {
    let currIndexes = [];
    for (let i = 0; i < particles.length; i++) {
        let dx = particles[i].x - mouseX;
        let dy = particles[i].y - mouseY;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radiusThreshold) {
            currIndexes.push({
                idx: i,
                target: particles[i],
                dx: dx,
                dy: dy
            });
        }
    }
    return currIndexes;
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();

    const mouseX = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const mouseY = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    return ({
        x: mouseX,
        y: mouseY
    });
}

function handleStart(e) {
    const pos = getMousePos(e);

    if (currentMode === 'add') {
        const selectedTypeString = particleSelector.value;
        const activeType = types[selectedTypeString];
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: pos.x + (Math.random() * 40 - 20),
                y: pos.y + (Math.random() * 40 - 20),
                vx: 0,
                vy: 0,
                type: activeType
            });
        }
    }
    else if (currentMode === 'remove') {
        const indexes = findParticlesAt(pos.x, pos.y);
        if (indexes.length > 0) {
            isDragging = true;
            const targets = indexes.map(item => item.idx);
            particles = particles.filter((p, i) => !targets.includes(i));
        }
    }
    else if (currentMode === 'move') {
        const indexes = findParticlesAt(pos.x, pos.y);
        if (indexes != null) {
            isDragging = true;
            draggedParticles = indexes;
        }
    }
}

function handleMove(e) {
    const pos = getMousePos(e);
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    if (currentMode === 'move') {
        if (draggedParticles === null) return;
        draggedParticles.forEach((p) => {
            p.target.x = pos.x + p.dx;
            p.target.y = pos.y + p.dy;

            p.target.vx = 0;
            p.target.vy = 0;
        })
    }
    else if (currentMode === 'remove') {
        const indexes = findParticlesAt(pos.x, pos.y);
        if (indexes.length > 0) {
            const targets = indexes.map(item => item.idx);
            particles = particles.filter((p, i) => !targets.includes(i));
        }
    }
}

function handleEnd(e) {
    isDragging = false;
    draggedParticles = null;
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseleave', handleEnd);

canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);

forceButton.addEventListener('click', () => {
    forceTable.hidden = !forceTable.hidden;
    if (!repelTable.hidden && !forceTable.hidden) {
        repelTable.hidden = true;
    }
});

repelButton.addEventListener('click', () => {
    repelTable.hidden = !repelTable.hidden;
    if (!forceTable.hidden && !repelTable.hidden) {
        forceTable.hidden = true;
    }
});

function rebuildTableUi() {
    function generateTableHtml(matrix, className) {
        let html = `<table><thead><tr><th>Type</th>`;
        types.forEach(t => html += `<th>${t.toLowerCase()}</th>`);
        html += `</tr></thead><tbody>`;

        types.forEach(fromType => {
            html += `<tr><th>${fromType.toLowerCase()}</th>`;
            types.forEach(toType => {
                let currentVal = matrix[fromType]?.[toType] ?? (className === 'attr-input' ? 1 : 15);
                html += `<td>
                    <input type="number" class=${className}
                        data-from="${fromType}" data-to="${toType}"
                        value="${currentVal}"
                </td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        return html;
    }

    forceTable.innerHTML = generateTableHtml(attractionMatrix, 'attr-input');
    repelTable.innerHTML = generateTableHtml(repulsionMatrix, 'repel-input');

    let html = ``;
    types.forEach(t => {
        html += `<option value="${types.indexOf(t)}">${t.toLowerCase()}</option>`;
    });
    particleSelector.innerHTML = html;
}

const typeName = document.getElementById('type-name');
const typeColor = document.getElementById('type-color');
const createButton = document.getElementById('create');

function addParticle(name, color) {
    const upperName = name.toUpperCase().trim();

    attractionMatrix[upperName] = {};
    repulsionMatrix[upperName] = {};

    types.forEach(existingType => {
        attractionMatrix[upperName][existingType] = 1;
        repulsionMatrix[upperName][existingType] = 15;

        attractionMatrix[existingType][upperName] = 1;
        repulsionMatrix[existingType][upperName] = 15;
    })

    types.push(upperName);
    typeColors[upperName] = color + 'b3';

    typeName.value = '';
    typeColor.value = '#ffffff';
    rebuildTableUi();
    updateTables();
}

createButton.addEventListener('click', (e) => {
    addParticle(typeName.value, typeColor.value);
    typeName.innerText = '';
    typeColor.innerText = '#ffffff';
})

function updateTables() {
    //Update Attraction
    document.querySelectorAll('.attr-input').forEach(input => {
        const from = input.getAttribute('data-from');
        const to = input.getAttribute('data-to');
        if (attractionMatrix[from]) attractionMatrix[from][to] = parseFloat(input.value) || 0;
    })

    //Update Repulsion
    document.querySelectorAll('.repel-input').forEach(input => {
        const from = input.getAttribute('data-from');
        const to = input.getAttribute('data-to');
        if (repulsionMatrix[from]) repulsionMatrix[from][to] = parseFloat(input.value) || 0;
    })
}
function setActiveMode(mode, buttonEl) {
    currentMode = mode;
    document.querySelectorAll('#ui-panel button').forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateTables();
    if (!paused) {
        update();
    }
    render();

    requestAnimationFrame(gameLoop);
}

function update() {
    const maxSq = maxRadius * maxRadius;
    const minSq = minRadius * minRadius;

    const w2 = canvas.width / 2;
    const h2 = canvas.height / 2;
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (i < particles.length - 1) {
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];

                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                if (dx > w2) dx -= canvas.width;
                else if (dx < -w2) dx += canvas.width;

                if (dy > h2) dy -= canvas.height;
                else if (dy < -h2) dy += canvas.height;
                let distSq = (dx)**2 + (dy)**2;

                if (distSq > maxSq || distSq < minSq) {
                    continue;
                }

                const attraction1 = attractionMatrix[p1.type][p2.type];
                const attraction2 = attractionMatrix[p2.type][p1.type];

                let totalForce1 = (force / (distSq + 1)) * attraction1;
                let totalForce2 = (force / (distSq + 1)) * attraction2;

                let fx1 = totalForce1 * dx;
                let fy1 = totalForce1 * dy;

                let fx2 = totalForce2 * dx;
                let fy2 = totalForce2 * dy;

                let repulse1 = repulsionMatrix[p1.type][p2.type]**2;
                let repulse2 = repulsionMatrix[p2.type][p1.type]**2;

                if (distSq <= repulse1) {
                    p1.vx += fx1 * 5;
                    p1.vy += fy1 * 5;
                } else {
                    p1.vx -= fx1;
                    p1.vy -= fy1;
                }
                if (distSq <= repulse2) {
                    p2.vx -= fx2 * 5;
                    p2.vy -= fy2 * 5;
                } else {
                    p2.vx += fx2;
                    p2.vy += fy2;
                }
            }
        }
        p1.vx *= friction;
        p1.vy *= friction;
        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.x = (p1.x + canvas.width) % canvas.width;
        p1.y = (p1.y + canvas.height) % canvas.height;
    }
}

function render() {
    for (let i = 0; i < particles.length; i++) {
        ctx.fillStyle = typeColors[particles[i].type];
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particleRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

rebuildTableUi();
updateTables();
requestAnimationFrame(gameLoop);