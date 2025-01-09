// This JavaScript file contains general logic for input elements.
// It also contains the logic for the controls (besides the gravity controls).

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

// Disable scrolling while interacting with any slider.
document.querySelectorAll('.slider').forEach((slider) => {
    slider.addEventListener('touchstart', () => {
        disableScrolling();
    });
    slider.addEventListener('touchend', () => {
        enableScrolling();
    });
});

// Logic for all segmented buttons
document.querySelectorAll('.segment').forEach(button => {
    button.addEventListener('click', () => {
        let segmentGroup = button.classList[1];
        document.querySelectorAll(`.segment.${segmentGroup}`).forEach(
            otherButton => otherButton.classList.remove('active')
        );
        button.classList.add('active');
    });
});

// Controlling the simulation speed

const speedSlider = document.getElementById('slider-speed');
const speedSliderLabel = document.getElementById('slider-value-speed');

speedSlider.value = 2;
speedSliderLabel.textContent = speedSlider.value;

speedSlider.addEventListener('input', () => {
    speedSliderLabel.textContent = speedSlider.value;
});

// Controlling the size of the brush

const brushSlider = document.getElementById('slider-brush');
const brushSliderLabel = document.getElementById('slider-value-brush');

brushSlider.value = 2;
brushSliderLabel.textContent = brushSlider.value;

brushSlider.addEventListener('input', () => {
    brushSliderLabel.textContent = brushSlider.value;
});

// Changing the sand type

/**
 * Defines the type of sand that is currently selected and will be used for the simulation.
 *
 * @type {string}
 */
let sandType = 'dynamic';

document.getElementById('dynamic-sand-button').addEventListener('click', () => {
    sandType = 'dynamic';
});

document.getElementById('static-sand-button').addEventListener('click', () => {
    sandType = 'static';
});

// Button for resetting the simulation
document.getElementById('reset-button').addEventListener('click', () => {
    reset();
});

