const maxBrightness = 1;
const minBrightness = 0.6;

let newGrainBrightness = maxBrightness;
let newGrainBrightnessIncrement = -0.01;

function SandGrain(x, y, brightness) {
    this.x = x;
    this.y = y;
    this.brightness = brightness;
}

// array containing all the sand grains
let sand = [];

// 2d array containing information, whether a pixel already contains a sand grain
let occupationGrid = Array.from({length: canvas.width}, () => new Array(canvas.height).fill(false));

// adds a new sand grain at a given position, if the position is available
function addGrain(x, y) {
    if (validPlace(x, y)) {
        sand.push(new SandGrain(x, y, newGrainBrightness));
        occupationGrid[x][y] = true;
        newGrainBrightness += newGrainBrightnessIncrement;

        if (newGrainBrightness < minBrightness) {
            newGrainBrightnessIncrement = Math.abs(newGrainBrightnessIncrement);
            newGrainBrightness = minBrightness;
        }
        if (newGrainBrightness > maxBrightness) {
            newGrainBrightnessIncrement = -Math.abs(newGrainBrightnessIncrement);
            newGrainBrightness = maxBrightness;
        }
    }
}

// checks, whether a given position is within the simulation bounds and not already occupied by a sand grain
function validPlace(x, y) {
    return !(x < 0 || x >= canvas.width || y < 0 || y >= canvas.height || occupationGrid[x][y]);
}

// advances the simulation by one tick
function step(xAcc, yAcc) {
    for (const grain of sand) {

        let xOffset = 0;
        let yOffset = 0;

        if (Math.random() * 10 < Math.abs(xAcc)) {
            xOffset = Math.sign(xAcc);
        }

        if (Math.random() * 10 < Math.abs(yAcc)) {
            yOffset = Math.sign(yAcc);
        }

        if (validPlace(grain.x + xOffset, grain.y + yOffset)) {
            occupationGrid[grain.x][grain.y] = false;
            grain.x += xOffset;
            grain.y += yOffset;
            occupationGrid[grain.x][grain.y] = true;
        }
    }
}
