# Particle Engine Using Javascript and a Canvas Element

This application is a interactive, browser-based **Particle Life Simulation**. It was made purely with Javascript and the HTML5 Canvas. It uses basic math to create life-like behaviors and complex patterns.

---

## Interaction Types

| Particle Type | Interacts With | Attraction Modifier | Repulsion Radius (px) |
| :--- | :--- | :--- | :--- |
| **Blue** | Blue, Red, Green | **Blue:** 1.0 <br> **Red:** 0.5 <br> **Green:** 0.0 | **Blue:** 15 <br> **Red:** 15 <br> **Green:** 0 |
| **Red** | Blue, Red, Green | **Blue:** 0.5 <br> **Red:** 1.0 <br> **Green:** 0.0 | **Blue:** 15 <br> **Red:** 15 <br> **Green:** 0 |
| **Green** | Blue, Red, Green | **Blue:** 0.5 <br> **Red:** 0.5 <br> **Green:** -0.2 | **Blue:** 50 <br> **Red:** 50 <br> **Green:** 0 |

---

## Interactive Features

The simulation includes a real-time UI control panel to let you actively manipulate the particels.

* **Add Mode:** Click to inject clusters of 10 particles of your choice (`Blue`, `Red`, `Green`).
* **Remove Mode:** Click or drag to erase particles by holding and dragging over them.
* **Move Mode:** Pick up clusters of particles to reposition them across the canvas.
* **Clear:** Instantly wipe the canvas of all particles.

---

## Getting Started

### Prerequisites
You only need a modern web browser (such as Chrome, Firefox, Edge, or Safari).

### Install Locally

Follow these steps to install and run the simulation locally
1. Clone this repository:
    ```bash
    git clone https://github.com/Liams-The-Best-At-Redstone/ParticleEngine
    ```
2. Open the directory:
    ```bash
    cd particle-life-sim
    ```
3. Open `index.html` in your web browser of choice.

---

### View Online (no download required)

Simply go to `https://liams-the-best-at-redstone.github.io/ParticleEngine/` in your web browser to view the simulation without installing it.