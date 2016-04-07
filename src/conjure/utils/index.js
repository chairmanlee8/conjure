'use strict';

/**
 * Convert array to map using the key function to generate keys.
 */
export function mapFromArray (arr, keyFn) {
    var m = {};
    arr.forEach(elem => {
        m[keyFn(elem)] = elem;
    });
    return m;
}

/**
 * Copy all keys from `json` to `dest`.
 */
export function copyAll (dest, json) {
    for (var k in json) {
        dest[k] = json[k];
    }
}
