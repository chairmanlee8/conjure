'use strict';

module.exports = make_range;

function make_range (arr) {
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