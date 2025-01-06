const maxBrightness = 1;
const minBrightness = 0.6;

let newGrainBrightness = maxBrightness;
let newGrainBrightnessIncrement = -0.01;

// A sand grain occupies a single pixel in the simulation.
// The brightness value determines the visual appearance of the grain.
function SandGrain(x, y, brightness) {
    this.x = x;
    this.y = y;
    this.brightness = brightness;
    this.stationary = 0;
}

// An array containing all the sand grains.
let sand = [];

// A 2d array containing information, whether a pixel contains a sand grain or not.
let occupationGrid = Array.from({length: canvas.width}, () => new Array(canvas.height).fill(false));

// Adds a new sand grain at a given position, if the position is available.
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

// Checks, whether a given position is within the bounds of the simulation.
function insideBounds(x, y) {
    return x >= 0 && x < canvas.width && y >= 0 && y < canvas.height;
}

// Checks, whether a given position is not occupied by a sand grain and within simulation bounds.
function validPlace(x, y) {
    return insideBounds(x, y) && !occupationGrid[x][y];
}

// Advances the simulation by one tick
function step(xAcc, yAcc) {
    for (const grain of sand) {
        let xAccRand = xAcc;
        let yAccRand = yAcc;

        if (grain.stationary >= 5) {
            xAccRand += (Math.random() * 10 - 5);
            yAccRand += (Math.random() * 10 - 5);
        }

        let xOffset = 0;
        let yOffset = 0;

        if (Math.random() * 10 < Math.abs(xAccRand)) {
            xOffset = Math.sign(xAccRand);
        }

        if (Math.random() * 10 < Math.abs(yAccRand)) {
            yOffset = Math.sign(yAccRand);
        }

        let newX = grain.x + xOffset;
        let newY = grain.y + yOffset;

        if (validPlace(newX, newY)) {
            occupationGrid[grain.x][grain.y] = false;
            grain.x = newX;
            grain.y = newY;
            occupationGrid[grain.x][grain.y] = true;
            grain.stationary = 0;
        } else if ((xOffset !== 0 || yOffset !== 0) && insideBounds(newX, newY)) {
            grain.stationary++;
        }
    }
}

// Removes all the sand from the simulation.
function reset() {
    sand = [];
    occupationGrid = Array.from({length: canvas.width}, () => new Array(canvas.height).fill(false));
}
