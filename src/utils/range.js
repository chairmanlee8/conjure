'use strict';

export default {
    fromArray: fromArray,
    toArray: toArray
}

/**
 * Convert an array of integers into a range-string.
 * See standard PS-1 (https://gist.github.com/smiley325/95de4e653362577eb471) for syntax description.
 */
function fromArray (arr) {
    var sortedIndex = arr.slice(0).sort(function (a, b) { return a-b });
    var rangeStr = "";

    var range = [];
    var pushRange = function (r) { rangeStr += ',' + ((r.length === 1) ? range[0] : (range[0] + 'R' + range[range.length-1])); };

    for (var i = 0; i < sortedIndex.length; i++) {
        if (range.length === 0 || (range.length > 0 && (range[range.length-1] == sortedIndex[i]-1))) {
            range.push(sortedIndex[i]);
        } else {
            pushRange(range);
            range.length = 0;
            i--;
        }
    }
    pushRange(range);

    return rangeStr.slice(1);
}

/**
 * Convert a range-string to an array of integers.
 */
function toArray (rs) {
    var parts = rs.split(","),
        result = [];

    parts.forEach(function (part) {
        var m = part.indexOf('R');
        if (m < 0) {
            result.push(parseInt(part));
        } else {
            var a = parseInt(part.slice(0, m)),
                b = parseInt(part.slice(m+1));

            for (var i = a; i <= b; i++) {
                result.push(i);
            }
        }
    });

    return result;
}
