// This JavaScript file contains logic concerning the input to and rendering of the canvas.

const canvas = document.getElementById("canvas");

/**
 * True, if the mouse is pressed on the canvas.
 *
 * @type {boolean}
 */
let mouseDown = false;

/**
 * True, if there is touchscreen input on the canvas.
 *
 * @type {boolean}
 */
let touchDown = false;

/**
 * The position of the mouse on the canvas in terms of simulation pixels.
 *
 * x=0 is the leftmost column of pixels, x increases when going to the right
 *
 * y=0 ist the uppermost row of pixels, y increases when going down
 *
 * @type {{x: number, y: number}}
 */
let mouse = {
    x: 0,
    y: 0
};

/**
 * Returns the actual size of a single simulated pixel in the horizontal direction.
 *
 * @returns {number} the actual size horizontal size of a pixel
 */
function pixelSizeX() {
    return parseFloat(getComputedStyle(canvas).width) / simulationWidth;
}

/**
 * Returns the actual size of a single simulated pixel in the vertical direction.
 *
 * @returns {number} the actual vertical size of a pixel
 */
function pixelSizeY() {
    return parseFloat(getComputedStyle(canvas).height) / simulationHeight;
}

// Getting mouse inputs for the canvas

canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        mouseDown = true;
    }
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
});

canvas.addEventListener('mousemove', (event) => {
    mouse.x = Math.floor(event.offsetX / pixelSizeX());
    mouse.y = Math.floor(event.offsetY / pixelSizeY());
});

// Getting touchscreen inputs for the canvas

canvas.addEventListener('touchstart', (event) => {
    disableScrolling();
    handleTouchInput(event);
    touchDown = true;
});

canvas.addEventListener('touchend', () => {
    enableScrolling();
    touchDown = false;
});

canvas.addEventListener('touchmove', handleTouchInput);

/**
 * Computes the "mouse" position on the canvas in terms of simulated pixels from a given TouchEvent.
 *
 * @param event {TouchEvent} the TouchEvent, from which the mouse position is computed
 */
function handleTouchInput(event) {
    let boundingRect = canvas.getBoundingClientRect();

    mouse.x = Math.floor((event.touches[0].pageX - boundingRect.left - window.scrollX) / pixelSizeX());
    mouse.y = Math.floor((event.touches[0].pageY - boundingRect.top - window.scrollY) / pixelSizeY());
}

// Interacting with the simulation

canvas.width = simulationWidth;
canvas.height = simulationHeight;

const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, simulationWidth, simulationHeight);

runSimulation();

/**
 * Adds sand to the simulation inside a circle around the mouse position.
 *
 * @param radius {number} the radius of the circle
 */
function addSandGrains(radius) {
    for (let deltaX = -radius; deltaX <= radius; deltaX++) {
        for (let deltaY = -radius; deltaY <= radius; deltaY++) {
            if (Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) <= radius) {
                addGrain(mouse.x + deltaX, mouse.y + deltaY);
            }
        }
    }
}

/**
 * Draws a grain of sand on the imageData, which will later be displayed on the canvas.
 *
 * @param grain {SandGrain} the drawn sand grain
 */
function draw(grain) {
    let i = (grain.x + grain.y * simulationWidth) * 4;

    imageData.data[i] = 250 * grain.brightness;         //red
    imageData.data[i + 1] = 190 * grain.brightness;     //green
    imageData.data[i + 2] = 60 * grain.brightness;      //blue
    imageData.data[i + 3] = 255;                        //alpha
}

/**
 * Continuously runs the simulation, draws it on the canvas, and adds sand to it on user input.
 */
function runSimulation() {
    imageData.data.fill(0);

    if (sandType === 'dynamic') {
        for (let i = 0; i < speedSlider.value; i++) {
            stepDynamic(xAcc, yAcc);
        }
    } else {
        for (let i = 0; i < speedSlider.value; i++) {
            stepStatic(xAcc, yAcc);
        }
    }

    if (mouseDown || touchDown) {
        addSandGrains(brushSlider.value - 1);
    }

    for (const grain of sand) {
        draw(grain);
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(runSimulation);
}
