/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById('particle-life');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let types = ['BLUE', 'RED', 'GREEN'];

let attractionMatrix = {
    'BLUE': {'BLUE': 1.0, 'RED': 1.0, 'GREEN': 1.0},
    'RED': {['BLUE']: 1.0, 'RED': 1.0, 'GREEN': 1.0},
    'GREEN': {'BLUE': 1.0, 'RED': 1.0, 'GREEN': 1.0}
};
let repulsionMatrix = {
    'BLUE': {'BLUE': 15, 'RED': 15, 'GREEN': 15},
    'RED': {'BLUE': 15, 'RED': 15, 'GREEN': 15},
    'GREEN': {'BLUE': 15, 'RED': 15, 'GREEN': 15}
};
let typeColors = {
    'BLUE': '#41b9ffb3',
    'RED': '#ee0c0cb3',
    'GREEN': '#0ecc08b3'
};
    

const minRadius = 0;
const maxRadius = 400;
const friction = 0.95;
const force = 0.5;
const particleRadius = 5;

const camera = {
    x: 0,
    y: 0,
    zoom: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    startCameraX: 0,
    startCameraY: 0
};


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

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseX = (clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (clientY - rect.top) * (canvas.height / rect.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    return ({
        x: ((mouseX - centerX) / camera.zoom) + centerX - camera.x,
        y: ((mouseY - centerY) / camera.zoom) + centerY - camera.y
    });
}

function handleStart(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const pos = getMousePos(e);

    if (currentMode === 'add') {
        const selectedTypeString = particleSelector.value;
        const activeType = types[selectedTypeString];
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: pos.x + (Math.random() * 40 - 20),
                y: pos.y + (Math.random() * 40 - 20),
                z: Math.random() * 40 - 20,
                vx: 0,
                vy: 0,
                vz: 0,
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
            p.target.vz = 0;
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

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const worldX = centerX + (mouseX - centerX) / camera.zoom - camera.x;
    const worldY = centerY + (mouseY - centerY) / camera.zoom - camera.y;

    camera.zoom = Math.max(0.1, Math.min(10, camera.zoom * Math.exp(-e.deltaY * 0.001)));
    camera.x = centerX + (mouseX - centerX) / camera.zoom - worldX;
    camera.y = centerY + (mouseY - centerY) / camera.zoom - worldY;
});

const keysHeld = {up: false, down: false, left: false, right: false};

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keysHeld.up = true;
    if (e.key === 'ArrowDown') keysHeld.down = true;
    if (e.key === 'ArrowLeft') keysHeld.left = true;
    if (e.key === 'ArrowRight') keysHeld.right = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keysHeld.up = false;
    if (e.key === 'ArrowDown') keysHeld.down = false;
    if (e.key === 'ArrowLeft') keysHeld.left = false;
    if (e.key === 'ArrowRight') keysHeld.right = false;
});

function moveCamera(speed) {
    let dx = (keysHeld.right ? 1 : 0) - (keysHeld.left ? 1 : 0);
    let dy = (keysHeld.down ? 1 : 0) - (keysHeld.up ? 1 : 0);

    if (dx !== 0 && dy !== 0) {
        let diagSpeed = speed * 0.707;
        camera.x -= dx * diagSpeed;
        camera.y -= dy * diagSpeed;
    } else {
        camera.x -= dx * speed;
        camera.y -= dy * speed;
    }
}

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) {
        e.preventDefault();
        camera.isDragging = true;
        camera.startX = e.clientX;
        camera.startY = e.clientY;
        camera.startCameraX = camera.x;
        camera.startCameraY = camera.y;
    }
});

window.addEventListener('mousemove', (e) => {
    if (!camera.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    camera.x = camera.startCameraX + (e.clientX - camera.startX) * (canvas.width / rect.width) / camera.zoom;
    camera.y = camera.startCameraY + (e.clientY - camera.startY) * (canvas.height / rect.height) / camera.zoom;
});

window.addEventListener('mouseup', () => camera.isDragging = false);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

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

document.querySelectorAll('.table-group').forEach((table) => {
    table.addEventListener('input', (e) => {
        if (e.target.classList.contains('attr-input') || e.target.classList.contains('repel-input')) {
            updateTables();
            store();
        }
    });
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
                    <input type="number" class="${className}"
                        data-from="${fromType}" data-to="${toType}"
                        value="${currentVal}">
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
        let lowerCase = t.toLowerCase();
        let result = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
        html += `<option value="${types.indexOf(t)}">${result}</option>`;
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
    store();
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

function store() {
    localStorage.setItem('types', JSON.stringify(types));
    localStorage.setItem('typeColors', JSON.stringify(typeColors));
    localStorage.setItem('attract', JSON.stringify(attractionMatrix));
    localStorage.setItem('repel', JSON.stringify(repulsionMatrix));
}

function get() {
    if (localStorage.getItem('types')) types = JSON.parse(localStorage.getItem('types'));
    if (localStorage.getItem('typeColors')) typeColors = JSON.parse(localStorage.getItem('typeColors'));
    if (localStorage.getItem('attract')) attractionMatrix = JSON.parse(localStorage.getItem('attract'));
    if (localStorage.getItem('repel')) repulsionMatrix = JSON.parse(localStorage.getItem('repel'));
}

const toggleUi = document.getElementById('toggle-ui');
const toggleableUi = document.getElementById('toggleable-ui');
toggleableUi.classList.remove('hidden');
toggleUi.addEventListener('click', () => {
    toggleableUi.classList.toggle('hidden');
    if (toggleableUi.classList.contains('hidden')) {
        toggleUi.textContent = 'Show UI';
    } else {
        toggleUi.textContent = 'Hide UI';
    }
});

function setActiveMode(mode, buttonEl) {
    currentMode = mode;
    document.querySelectorAll('#ui-panel button').forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');
}

function gameLoop() {
    moveCamera(5);
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

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const minX = centerX - centerX / camera.zoom - camera.x;
    const maxX = centerX + centerX / camera.zoom - camera.x;
    const minY = centerY - centerY / camera.zoom - camera.y;
    const maxY = centerY + centerY / camera.zoom - camera.y;
    const worldWidth = maxX - minX;
    const worldHeight = maxY - minY;
    const wrap = (position, min, size) => ((position - min) % size + size) % size + min;

    for (const particle of particles) {
        particle.x = wrap(particle.x, minX, worldWidth);
        particle.y = wrap(particle.y, minY, worldHeight);
    }

    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (i < particles.length - 1) {
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];

                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let dz = p1.z - p2.z;
                dx -= Math.round(dx / worldWidth) * worldWidth;
                dy -= Math.round(dy / worldHeight) * worldHeight;
                let distSq = (dx)**2 + (dy)**2 + (dz)**2;

                if (distSq > maxSq || distSq < minSq) {
                    continue;
                }

                const attraction1 = attractionMatrix[p1.type][p2.type];
                const attraction2 = attractionMatrix[p2.type][p1.type];

                let totalForce1 = (force / (distSq + 1)) * attraction1;
                let totalForce2 = (force / (distSq + 1)) * attraction2;

                let fx1 = totalForce1 * dx;
                let fy1 = totalForce1 * dy;
                let fz1 = totalForce1 * dz;

                let fx2 = totalForce2 * dx;
                let fy2 = totalForce2 * dy;
                let fz2 = totalForce2 * dz;

                let repulse1 = repulsionMatrix[p1.type][p2.type]**2;
                let repulse2 = repulsionMatrix[p2.type][p1.type]**2;

                if (distSq <= repulse1) {
                    p1.vx += fx1 * 5;
                    p1.vy += fy1 * 5;
                    p1.vz += fz1 * 5;
                } else {
                    p1.vx -= fx1;
                    p1.vy -= fy1;
                    p1.vz -= fz1;
                }
                if (distSq <= repulse2) {
                    p2.vx -= fx2 * 5;
                    p2.vy -= fy2 * 5;
                    p2.vz -= fz2 * 5;
                } else {
                    p2.vx += fx2;
                    p2.vy += fy2;
                    p2.vz += fz2;
                }
            }
        }
        p1.vx *= friction;
        p1.vy *= friction;
        p1.vz *= friction;
        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.z += p1.vz;
        p1.x = wrap(p1.x, minX, worldWidth);
        p1.y = wrap(p1.y, minY, worldHeight);
    }
}

function render() {
    ctx.save();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-centerX + camera.x, -centerY + camera.y);
    for (let i = 0; i < particles.length; i++) {
        ctx.fillStyle = typeColors[particles[i].type];
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particleRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

get();
rebuildTableUi();
updateTables();
requestAnimationFrame(gameLoop);