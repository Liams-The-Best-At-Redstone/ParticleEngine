/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById('particle-life');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Force Inputs
const blueToBlueForce = document.getElementById('blue-to-blue-force');
const blueToRedForce = document.getElementById('blue-to-red-force');
const blueToGreenForce = document.getElementById('blue-to-green-force');

const redToBlueForce = document.getElementById('red-to-blue-force');
const redToRedForce = document.getElementById('red-to-red-force');
const redToGreenForce = document.getElementById('red-to-green-force');

const greenToBlueForce = document.getElementById('green-to-blue-force');
const greenToRedForce = document.getElementById('green-to-red-force');
const greenToGreenForce = document.getElementById('green-to-green-force');

//Repel Inputs
const blueToBlueRepel = document.getElementById('blue-to-blue-repel');
const blueToRedRepel = document.getElementById('blue-to-red-repel');
const blueToGreenRepel = document.getElementById('blue-to-green-repel');

const redToBlueRepel = document.getElementById('red-to-blue-repel');
const redToRedRepel = document.getElementById('red-to-red-repel');
const redToGreenRepel = document.getElementById('red-to-green-repel');

const greenToBlueRepel = document.getElementById('green-to-blue-repel');
const greenToRedRepel = document.getElementById('green-to-red-repel');
const greenToGreenRepel = document.getElementById('green-to-green-repel');

const types = Object.freeze({
    RED: 'RED',
    BLUE: 'BLUE',
    GREEN: 'GREEN'
});

const attractionMatrix = {
    [types.BLUE]: {[types.BLUE]: 0.0, [types.RED]: 0.0, [types.GREEN]: 0.0},
    [types.RED]: {[types.BLUE]: 0.0, [types.RED]: 0.0, [types.GREEN]: 0.0},
    [types.GREEN]: {[types.BLUE]: 0.0, [types.RED]: 8.0, [types.GREEN]: 0.0}
};
const repulsionMatrix = {
    [types.BLUE]: {[types.BLUE]: 15, [types.RED]: 15, [types.GREEN]: 0},
    [types.RED]: {[types.BLUE]: 15, [types.RED]: 15, [types.GREEN]: 0.0},
    [types.GREEN]: {[types.BLUE]: 50, [types.RED]: 80, [types.GREEN]: 0.0}
};
const typeColors = {
    [types.BLUE]: 'rgba(65, 185, 255, 0.7)',
    [types.RED]: 'rgba(238, 12, 12, 0.7)',
    [types.GREEN]: 'rgba(14, 204, 8, 0.7)'
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
})
document.get

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
    const rect = canvas.getBoundingClientRect();
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

function updateTables() {
    //Update Attraction
    attractionMatrix[types.BLUE][types.BLUE] = blueToBlueForce.value;
    attractionMatrix[types.BLUE][types.RED] = blueToRedForce.value;
    attractionMatrix[types.BLUE][types.GREEN] = blueToGreenForce.value;
    
    attractionMatrix[types.RED][types.BLUE] = redToBlueForce.value;
    attractionMatrix[types.RED][types.RED] = redToRedForce.value;
    attractionMatrix[types.RED][types.GREEN] = redToGreenForce.value;
    
    attractionMatrix[types.GREEN][types.BLUE] = greenToBlueForce.value;
    attractionMatrix[types.GREEN][types.RED] = greenToRedForce.value;
    attractionMatrix[types.GREEN][types.GREEN] = greenToGreenForce.value;

    //Update Repulsion
    repulsionMatrix[types.BLUE][types.BLUE] = blueToBlueRepel.value;
    repulsionMatrix[types.BLUE][types.RED] = blueToRedRepel.value;
    repulsionMatrix[types.BLUE][types.GREEN] = blueToGreenRepel.value;
    
    repulsionMatrix[types.RED][types.BLUE] = redToBlueRepel.value;
    repulsionMatrix[types.RED][types.RED] = redToRedRepel.value;
    repulsionMatrix[types.RED][types.GREEN] = redToGreenRepel.value;
    
    repulsionMatrix[types.GREEN][types.BLUE] = greenToBlueRepel.value;
    repulsionMatrix[types.GREEN][types.RED] = greenToRedRepel.value;
    repulsionMatrix[types.GREEN][types.GREEN] = greenToGreenRepel.value;
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

updateTables();
requestAnimationFrame(gameLoop);
