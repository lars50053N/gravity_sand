// This JavaScript file contains the logic for the gravity controls.

/**
 * True, if the gravity controls are in automatic mode (gravity controlled by the device's sensors).
 * False, if the gravity controls are in manual mode (gravity controlled by sliders).
 *
 * @type {boolean}
 */
let automaticMode = false;

/**
 * Current acceleration in the x direction used for the simulation.
 * For negative values, sand goes to the left, for positive values, sand goes to the right (generally).
 *
 * @type {number}
 */
let xAcc = 0;

/**
 * Current acceleration in the y direction used for the simulation.
 * For negative values, sand floats to the top, for positive values, sand falls to the bottom (generally).
 *
 * @type {number}
 */
let yAcc = 9.7;

const xSlider = document.getElementById('slider-x');
const ySlider = document.getElementById('slider-y');

const xSliderLabel = document.getElementById('slider-value-x');
const ySliderLabel = document.getElementById('slider-value-y');

updateSliderValues();

/**
 * Whether device motion has been accessed.
 *
 * @type {boolean}
 */
let activatedDeviceMotion = false;

/**
 * Whether any sensor data has been received from devicemotion.
 *
 * @type {boolean}
 */
let receivedDeviceMotionData = false;

/**
 * Whether the website was opened on an iOS device.
 *
 * @type {boolean}
 */
const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);

/**
 * Starts the collection of acceleration sensor data.
 *
 * Needed because, on iOS, device motion can only be accessed after given explicit permission by the user.
 */
function activateDeviceMotion() {
    window.addEventListener('devicemotion', (event) => {
        if (automaticMode
            && event.accelerationIncludingGravity.x != null
            && event.accelerationIncludingGravity.y != null
        ) {
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

            updateSliderValues();

            if (!receivedDeviceMotionData) {
                receivedDeviceMotionData = true;
                sensorAlert.style.display = 'none';
                screenRotationAlert.style.display = 'flex';
            }
        }
    });
    activatedDeviceMotion = true;
}

/**
 * Sets the values and labels of the x- and y-slider to the current x- and y-acceleration.
 */
function updateSliderValues() {
    xSlider.value = xAcc.toString();
    ySlider.value = yAcc.toString();
    xSliderLabel.textContent = xAcc.toPrecision(2);
    ySliderLabel.textContent = yAcc.toPrecision(2);
}

xSlider.addEventListener('input', () => {
    xSliderLabel.textContent = xSlider.value.toString();
    xAcc = parseFloat(xSlider.value);
});

ySlider.addEventListener('input', () => {
    ySliderLabel.textContent = ySlider.value.toString();
    yAcc = parseFloat(ySlider.value);
});

// switching between manual and automatic modes

const screenRotationAlert = document.getElementById('alert-rotation');
const sensorAlert = document.getElementById('alert-sensor');

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