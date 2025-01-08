const canvas = document.getElementById("canvas");

canvas.width = simulationWidth;
canvas.height = simulationHeight;

// getting mouse and touch inputs for the canvas

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

// getting mouse inputs for the canvas

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

// getting touchscreen inputs for the canvas

/**
 * Disables scrolling. This is done when touch input is used for interacting with the canvas or a slider.
 */
function disableScrolling() {
    document.body.style.overflow = 'hidden';
}

/**
 * Enables Scrolling. This is done when a touch input that interacted with the canvas or a slider is ended.
 */
function enableScrolling() {
    document.body.style.overflow = 'auto';
}

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

// X- and Y-Axis acceleration, entered manually through sliders when in manual mode or
// measured by sensors when in automatic mode

let automaticMode = false;

let xAcc = 0;
let yAcc = 9.7;

const xSlider = document.getElementById('slider-x');
const ySlider = document.getElementById('slider-y');

const xSliderLabel = document.getElementById('slider-value-x');
const ySliderLabel = document.getElementById('slider-value-y');

xSlider.value = xAcc;
ySlider.value = yAcc;
xSliderLabel.textContent = xAcc;
ySliderLabel.textContent = yAcc;

let activatedDeviceMotion = false;
let receivedDeviceMotionData = false;

const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);

/**
 * Starts the collection of acceleration sensor data.
 *
 * Needed because, on iOS, device motion can only be accessed after given explicit permission by the user.
 */
function activateDeviceMotion() {
    window.addEventListener('devicemotion', (event) => {
        if (automaticMode) {
            // Which direction the DeviceMotion axes point to (relative to the screen)
            // depends on the screen's orientation.
            switch (screen.orientation.angle) {
                case 90: {
                    xAcc = event.accelerationIncludingGravity.y;
                    yAcc = event.accelerationIncludingGravity.x;
                    break;
                }
                case 180: {
                    xAcc = event.accelerationIncludingGravity.x;
                    yAcc = -event.accelerationIncludingGravity.y;
                    break;
                }
                case 270: {
                    xAcc = -event.accelerationIncludingGravity.y;
                    yAcc = -event.accelerationIncludingGravity.x;
                    break;
                }
                default: {
                    xAcc = -event.accelerationIncludingGravity.x;
                    yAcc = event.accelerationIncludingGravity.y;
                    break;
                }
            }

            // accelerationIncludingGravity is flipped on Apple devices
            if (isIos) {
                xAcc = -xAcc;
                yAcc = -yAcc;
            }

            xSlider.value = xAcc;
            ySlider.value = yAcc;
            xSliderLabel.textContent = xAcc.toPrecision(2);
            ySliderLabel.textContent = yAcc.toPrecision(2);

            if (!receivedDeviceMotionData) {
                receivedDeviceMotionData = true;
                sensorAlert.style.display = 'none';
                screenRotationAlert.style.display = 'flex';
            }
        }
    });
    activatedDeviceMotion = true;
}

xSlider.addEventListener('input', () => {
    xSliderLabel.textContent = xSlider.value;
    xAcc = parseFloat(xSlider.value);
});

ySlider.addEventListener('input', () => {
    ySliderLabel.textContent = ySlider.value;
    yAcc = parseFloat(ySlider.value);
});

// Disable scrolling while interacting with any slider.
document.querySelectorAll('.slider').forEach((slider) => {
    slider.addEventListener('touchstart', () => {
        disableScrolling();
    });
    slider.addEventListener('touchend', () => {
        enableScrolling();
    });
});

// switching between manual and automatic modes

const screenRotationAlert = document.getElementById('alert-rotation');
const sensorAlert = document.getElementById('alert-sensor');

document.querySelectorAll('.segment').forEach(button => {
    button.addEventListener('click', () => {
        let segmentGroup = button.classList[1];
        document.querySelectorAll(`.segment.${segmentGroup}`).forEach(
            otherButton => otherButton.classList.remove('active')
        );
        button.classList.add('active');
    });
});

document.getElementById('manual-button').addEventListener('click', () => {
    automaticMode = false;

    xSlider.style.display = 'block';
    ySlider.style.display = 'block';

    screenRotationAlert.style.display = 'none';
    sensorAlert.style.display = 'none';
});

document.getElementById('automatic-button').addEventListener('click', () => {
    automaticMode = true;

    xSlider.style.display = 'none';
    ySlider.style.display = 'none';

    if (receivedDeviceMotionData) {
        screenRotationAlert.style.display = 'flex';
    } else {
        sensorAlert.style.display = 'flex';
    }

    if (!activatedDeviceMotion) {
        if (typeof DeviceMotionEvent.requestPermission === "function") {
            DeviceMotionEvent.requestPermission()
                .then((permissionState) => {
                    if (permissionState === "granted") {
                        activateDeviceMotion();
                    }
                })
                .catch(console.error);
        } else {
            activateDeviceMotion();
        }
    }
});

// controlling the simulation speed

const speedSlider = document.getElementById('slider-speed');
speedSlider.value = 2;

const speedSliderLabel = document.getElementById('slider-value-speed');
speedSliderLabel.textContent = speedSlider.value;

speedSlider.addEventListener('input', () => {
    speedSliderLabel.textContent = speedSlider.value;
});

// Changing the sand type

let sandType = 'dynamic';

document.getElementById('dynamic-sand-button').addEventListener('click', () => {
    sandType = 'dynamic';
});

document.getElementById('static-sand-button').addEventListener('click', () => {
    sandType = 'static';
});

// button for resetting the simulation
document.getElementById('reset-button').addEventListener('click', () => {
    reset();
});

// popup buttons

const popupBlur = document.getElementById('popup-blur');

// Opens the corresponding popup when clicking on any popup button.
document.querySelectorAll('.popup-button').forEach(button => {
    button.addEventListener('click', () => {
        let buttonClass = button.classList[1];
        document.querySelector(`.popup.${buttonClass}`).style.display = 'flex';
        popupBlur.style.display = 'flex';
    })
});

// Closes the popup when clicking outside of it.
popupBlur.addEventListener('click', () => {
    document.querySelectorAll('.popup').forEach(popup => {
        popup.style.display = 'none';
    })
    popupBlur.style.display = 'none';
});

// interacting with the simulation

const ctx = canvas.getContext('2d');

const imageData = ctx.getImageData(0, 0, simulationWidth, simulationHeight);

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
        addGrain(mouse.x, mouse.y);
        addGrain(mouse.x + 1, mouse.y);
        addGrain(mouse.x - 1, mouse.y);
        addGrain(mouse.x, mouse.y + 1);
        addGrain(mouse.x, mouse.y - 1);
    }

    for (const grain of sand) {
        draw(grain);
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(runSimulation);
}

runSimulation();
