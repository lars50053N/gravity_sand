/**
 * The width of the simulation in terms of pixels.
 *
 * @type {number}
 */
const simulationWidth = 128;

/**
 * The height of the simulation in terms of pixels.
 *
 * @type {number}
 */
const simulationHeight = 128;

/**
 * Maximum possible brightness factor for a sand grain.
 *
 * @type {number}
 */
const maxBrightness = 1;

/**
 * Minimum possible brightness factor for a sand grain.
 *
 * @type {number}
 */
const minBrightness = 0.6;

/**
 * Brightness factor for the next sand grain which is added to the simulation.
 *
 * @type {number}
 */
let newGrainBrightness = maxBrightness;

/**
 * Change to the brightness factor between sand grains.
 *
 * @type {number}
 */
let newGrainBrightnessIncrement = -0.01;

/**
 * An array containing all the sand grains.
 *
 * @type {SandGrain[]}
 */
let sand = [];

/**
 * Contains information for each pixel position, whether it is occupied by a sand grain.
 *
 * For example, occupationGrid[2][5] checks if there is a sand grain on position (2, 5).
 *
 * @type {boolean[][]}
 */
let occupationGrid = Array.from({length: simulationWidth}, () => new Array(simulationHeight).fill(false));

/**
 * Creates a new sand grain, which occupies a single pixel in the simulation.
 *
 * @param x {number} the grain's x position (x=0 is the leftmost pixel column, x increases when going to the right)
 * @param y {number} the grain's y position (y=0 is the uppermost pixel column, y increases when going down)
 * @param brightness {number} the grain's brightness factor, which determines the grain's brightness on the canvas
 * @constructor
 */
function SandGrain(x, y, brightness) {
    this.x = x;
    this.y = y;
    this.brightness = brightness;
    this.stationary = 0;
}

/**
 * Adds a new sand grain at a given position,
 * if the position is within bounds and not already occupied by another grain.
 *
 * @param x {number} the x position, where the grain is added
 * (x=0 is the leftmost pixel column, x increases when going to the right)
 *
 * @param y {number} the y position, where the grain is added
 * (y=0 is the uppermost pixel column, y increases when going down)
 */
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

/**
 * Checks, whether a given position is within the bounds of the simulation.
 *
 * @param x {number} the x position (x=0 is the leftmost pixel column, x increases when going to the right)
 * @param y {number} the y position (y=0 is the uppermost pixel column, y increases when going down)
 * @returns {boolean} whether the given position is inside simulation bounds
 */
function insideBounds(x, y) {
    return x >= 0 && x < simulationWidth && y >= 0 && y < simulationHeight;
}

/**
 * Checks, whether a given position is within simulation bounds and does not have a sand grain inside it.
 *
 * @param x {number} the x position (x=0 is the leftmost pixel column, x increases when going to the right)
 * @param y {number} the y position (y=0 is the uppermost pixel column, y increases when going down)
 * @returns {boolean} whether the given position is inside simulation bounds and doesn't contain sand
 */
function validPlace(x, y) {
    return insideBounds(x, y) && !occupationGrid[x][y];
}

/**
 * Advances the simulation by a single step using dynamic sand.
 * Sand will not remain stationary when piled up on the ground, but it instead will move dynamically.
 *
 * When a sand grain is stationary (the last 5 movement attempts landed on positions that were already occupied),
 * the x- and y-accelerations for this sand grain are changed by a random amount.
 * This random amount is dependent on the magnitude of the acceleration of the respective cross axis.
 *
 * When a sand grain is not stationary, it behaves normally (the same way as when using static sand).
 *
 * @param xAcc {number} The x-axis acceleration determines the chance for each sand grain to move by a single position
 * in the direction of the x-axis acceleration, further randomized when a grain is stationary.
 *
 * @param yAcc {number} The y-axis acceleration determines the chance for each sand grain to move by a single position
 * in the direction of the y-axis acceleration, further randomized when a grain is stationary.
 */
function stepDynamic(xAcc, yAcc) {
    for (const grain of sand) {
        let xAccRand = xAcc;
        let yAccRand = yAcc;

        if (grain.stationary >= 5) {
            xAccRand += (Math.random() - 1/2) * Math.pow(yAcc, 2);
            yAccRand += (Math.random() - 1/2) * Math.pow(xAcc, 2);
        }

        let xOffset = 0;
        let yOffset = 0;

        if (Math.random() * 20 < Math.abs(xAccRand)) {
            xOffset = Math.sign(xAccRand);
        }

        if (Math.random() * 20 < Math.abs(yAccRand)) {
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

/**
 * Advances the simulation by a single step using static sand.
 *
 * @param xAcc {number} The x-axis acceleration determines the chance for each sand grain to move by a single position
 * in the direction of the x-axis acceleration.
 *
 * @param yAcc {number} The y-axis acceleration determines the chance for each sand grain to move by a single position
 * in the direction of the y-axis acceleration.
 */
function stepStatic(xAcc, yAcc) {
    for (const grain of sand) {
        let xOffset = 0;
        let yOffset = 0;

        if (Math.random() * 20 < Math.abs(xAcc)) {
            xOffset = Math.sign(xAcc);
        }

        if (Math.random() * 20 < Math.abs(yAcc)) {
            yOffset = Math.sign(yAcc);
        }

        let newX = grain.x + xOffset;
        let newY = grain.y + yOffset;

        if (validPlace(newX, newY)) {
            occupationGrid[grain.x][grain.y] = false;
            grain.x = newX;
            grain.y = newY;
            occupationGrid[grain.x][grain.y] = true;
        }
    }
}

/**
 * Removes all the sand from the simulation.
 */
function reset() {
    sand = [];
    occupationGrid = Array.from({length: simulationWidth}, () => new Array(simulationHeight).fill(false));
}
