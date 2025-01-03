const canvas = document.getElementById("canvas");

// height and width of the canvas in terms of simulated pixels
canvas.width = 128;
canvas.height = 128;

// getting mouse inputs for the canvas

let mouseDown = false;
let touchDown = false;

let mouse = {
    x: 0,
    y: 0
};

function pixelSizeX() {
    return parseFloat(getComputedStyle(canvas).width) / canvas.width;
}

function pixelSizeY() {
    return parseFloat(getComputedStyle(canvas).height) / canvas.height;
}

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

// Getting touchscreen inputs for the canvas

function boundingRect() {
    return canvas.getBoundingClientRect();
}

canvas.addEventListener('touchstart', (event) => {
    document.getElementById('body').style.overflow = 'hidden';

    mouse.x = Math.floor((event.touches[0].pageX - boundingRect().left) / pixelSizeX());
    mouse.y = Math.floor((event.touches[0].pageY - boundingRect().top) / pixelSizeY());

    touchDown = true;
});

canvas.addEventListener('touchend', () => {
    document.getElementById('body').style.overflow = 'auto';
    touchDown = false;
});

window.addEventListener('touchmove', (event) => {
    mouse.x = Math.floor((event.touches[0].pageX - boundingRect().left) / pixelSizeX());
    mouse.y = Math.floor((event.touches[0].pageY - boundingRect().top) / pixelSizeY());
});

// X- and Y-Axis acceleration, entered manually through sliders when in manual mode or
// measured by sensors when in automatic mode

let automaticMode = false;

let xAcc = 0;
let yAcc = 9.7;

const xSlider = document.getElementById('slider-x');
const ySlider = document.getElementById('slider-y');

xSlider.value = xAcc;
ySlider.value = yAcc;

window.addEventListener('devicemotion', (event) => {
    if (automaticMode) {
        xAcc = event.accelerationIncludingGravity.x;
        yAcc = event.accelerationIncludingGravity.y;
        xSlider.value = xAcc;
        ySlider.value = yAcc;
        document.getElementById('slider-x').value = xAcc;
        document.getElementById('slider-y').value = yAcc;
    }
});

xSlider.addEventListener('input', () => {
    document.getElementById('slider-value-x').textContent = xSlider.value;
    xAcc = parseFloat(xSlider.value);
})

ySlider.addEventListener('input', () => {
    document.getElementById('slider-value-y').textContent = ySlider.value;
    yAcc = parseFloat(ySlider.value);
})

// switching between manual and automatic modes

document.querySelectorAll('.segment').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.segment').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

document.getElementById('manual-button').addEventListener('click', () => {
    automaticMode = false;
    xSlider.style.display = 'block';
    ySlider.style.display = 'block';
})

document.getElementById('automatic-button').addEventListener('click', () => {
    automaticMode = true;
    xSlider.style.display = 'none';
    ySlider.style.display = 'none';
})

// interacting with the simulation

const ctx = canvas.getContext('2d');

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// adds a grain of sand on the imageData, which will later be displayed on the canvas
function draw(grain) {
    let i = (grain.x + grain.y * canvas.width) * 4;

    imageData.data[i] = 250 * grain.brightness;         //red
    imageData.data[i + 1] = 190 * grain.brightness;     //green
    imageData.data[i + 2] = 60 * grain.brightness;      //blue
    imageData.data[i + 3] = 255;                        //alpha
}

// loop for continuously running the simulation, reading inputs to add sand to it and drawing on the canvas
function runSimulation() {
    imageData.data.fill(0);

    step(xAcc, yAcc);

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
