const canvas = document.getElementById("canvas");

// height and width of the canvas in terms of simulated pixels
canvas.width = 128;
canvas.height = 128;

// getting mouse and touch inputs for the canvas

let mouseDown = false;
let touchDown = false;

let mouse = {
    x: 0,
    y: 0
};

// Returns the actual size of a single simulated pixel in the horizontal direction.
function pixelSizeX() {
    return parseFloat(getComputedStyle(canvas).width) / canvas.width;
}

// Returns the actual size of a single simulated pixel in the vertical direction.
function pixelSizeY() {
    return parseFloat(getComputedStyle(canvas).height) / canvas.height;
}

// getting mouse inputs for the canvas

canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        mouseDown = true;
    }
});

canvas.addEventListener('mouseup', () => {
    mouseDown = false;
});

canvas.addEventListener('mousemove', (event) => {
    mouse.x = Math.floor(event.offsetX / pixelSizeX());
    mouse.y = Math.floor(event.offsetY / pixelSizeY());
});

// getting touchscreen inputs for the canvas

// Disables scrolling. (used when touch input is used for something else)
function disableScrolling() {
    document.getElementById('body').style.overflow = 'hidden';
}

// Enables Scrolling. (used when a touch input is ended)
function enableScrolling() {
    document.getElementById('body').style.overflow = 'auto';
}

function boundingRect() {
    return canvas.getBoundingClientRect();
}

function handleTouchInput(event) {
    mouse.x = Math.floor((event.touches[0].pageX - boundingRect().left) / pixelSizeX());
    mouse.y = Math.floor((event.touches[0].pageY - boundingRect().top - window.scrollY) / pixelSizeY());
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

window.addEventListener('touchmove', handleTouchInput);

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

function activateDeviceMotion() {
    window.addEventListener('devicemotion', (event) => {
        if (automaticMode) {
            switch (screen.orientation.angle) {
                case 0:
                    xAcc = -event.accelerationIncludingGravity.x;
                    yAcc = event.accelerationIncludingGravity.y;
                    break;
                case 90:
                    xAcc = event.accelerationIncludingGravity.y;
                    yAcc = event.accelerationIncludingGravity.x;
                    break;
                case 180:
                    xAcc = event.accelerationIncludingGravity.x;
                    yAcc = -event.accelerationIncludingGravity.y;
                    break;
                case 270:
                    xAcc = -event.accelerationIncludingGravity.y;
                    yAcc = -event.accelerationIncludingGravity.x;
                    break;
            }

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

// disable Scrolling while interacting with a slider
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

document.querySelectorAll('.popup-button').forEach(button => {
    button.addEventListener('click', () => {
        let buttonClass = button.classList[1];
        document.querySelector(`.popup.${buttonClass}`).style.display = 'flex';
        popupBlur.style.display = 'flex';
    })
});

popupBlur.addEventListener('click', () => {
    document.querySelectorAll('.popup').forEach(popup => {
        popup.style.display = 'none';
    })
    popupBlur.style.display = 'none';
});

// interacting with the simulation

const ctx = canvas.getContext('2d');

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Adds a grain of sand on the imageData, which will later be displayed on the canvas.
function draw(grain) {
    let i = (grain.x + grain.y * canvas.width) * 4;

    imageData.data[i] = 250 * grain.brightness;         //red
    imageData.data[i + 1] = 190 * grain.brightness;     //green
    imageData.data[i + 2] = 60 * grain.brightness;      //blue
    imageData.data[i + 3] = 255;                        //alpha
}

// Continuously runs the simulation, draws it on the canvas, and adds sand to it on user input.
function runSimulation() {
    imageData.data.fill(0);

    if (sandType === 'dynamic') {
        for (let i = 0; i < speedSlider.value; i++) {
            step(xAcc, yAcc);
        }
    } else {
        for (let i = 0; i < speedSlider.value; i++) {
            stepOriginal(xAcc, yAcc);
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
