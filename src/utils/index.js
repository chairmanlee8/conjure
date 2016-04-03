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
