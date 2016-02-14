'use strict';

module.exports = handle;

function handle (thisArg, fn) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        fn.apply(thisArg, args);

        return false;
    }
}