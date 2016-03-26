/**
 * @module utils/show
 */

'use strict';

module.exports = {
    filesize: filesize
}

/**
 * Convert a raw byte number into a human-readable figure.
 *
 * @example
 * filesize(1024);      // returns "1024 KB"
 *
 * @param {number} num_bytes - number to convert
 * @returns {string}
 */
function filesize (num_bytes, options) {
    if (num_bytes < 1024) {
        return num_bytes + " B";
    } else if (num_bytes < 1024 * 1024) {
        return Math.floor(num_bytes / 1024) + " KiB";
    } else if (num_bytes < 1024 * 1024 * 1024) {
        return Math.floor(num_bytes / 1024 / 1024) + " MiB";
    } else {
        return Math.floor(num_bytes / 1024 / 1024 / 1024) + " GiB";
    }
}