
/**
 * returns whether a value is in between 2 others
 * 
 * @param {number} val - value to check
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @param {number} equals - inclusive or exclusive range. Defaults to inclusive
 * @returns {boolean} - whether value is inside range
 */
export const isBtwn = (val, min, max, equals = true) =>
  equals ? val >= min && val <= max : val > min && val < max;

/**
 * returns a value clamped to a range
 * 
 * @param {number} value - value to clamp
 * @param {number} min - minimum possible value
 * @param {number} max - maximum possible value
 * @returns {number} - clamped value
 */
export const clamp = (value, min, max) => 
  Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));

/**
 * returns a value mapped from one range to another
 * 
 * @param {number} val - value to map
 * @param {number} min - value's minimum possible value
 * @param {number} max - value's maximum possible value
 * @param {number} min2 - new maximum possible value
 * @param {number} max2 - new minimum possible value
 * @returns {number} - new mapped value
 */
export const map = (val, min, max, min2, max2) =>
  (val - min) / (max - min) * (max2 - min2) + min2;
  
/**
 * returns random num between range or item in array
 * 
 * @param {number||number[]} min - minimum value or array
 * @param {number} max - maximum value
 * @returns {number||any} - random num between range or item in array
 */
export const random = (min, max) => 
  typeof min === "object" 
    ? min[Math.floor(Math.random() * min.length)]
    : Math.random() * (max - min) + min;
 
/**
 * checks if all values are equal to value
 * 
 * @param {any} val - primitive value to check equality
 * @param  {...any} args - primitive values to check with
 * @returns {boolean} - if all values equal value
 */
export const multiEqual = (val, ...args) => 
  args.every(num => num === val);

/**
 * returns value closest to num 
 * 
 * @param {number} num - num to check closeness
 * @param {...number} vals - values to check which is closer
 * @returns {number} - closest value
 */
export const closer = (num, ...vals) =>
  vals.reduce((lowest, val) => 
    Math.abs(num - val) < lowest 
      ? val 
      : lowest, Infinity
  );