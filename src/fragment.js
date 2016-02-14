'use strict';

module.exports = Fragment;

var FRAGMENT_COUNTER = 0,
    FRAGMENT_TABLE = {};

function Fragment (parent) {
    this.$id = FRAGMENT_COUNTER++;
    this.$parentId = parent ? parent.$id : null;
    this.$children = [];

    FRAGMENT_TABLE[this.$id] = this;
}

Fragment.prototype.render = function () {
    return null;
}

/**
 * Generic event handler. Turns class methods into closures that can be used as event handlers. If you need to use
 * data from the event object, or have access to the event object in general, use handleEvent instead.
 *
 * For non class methods (or methods that call into a different `this`, use framework/utils/handle).
 */
Fragment.prototype.handle = function (fn) {
    var self = this,
        args = Array.prototype.slice.call(arguments, 1);

    return function (ev) {
        fn.apply(self, args);
    }
}

Fragment.prototype.destroy = function () {
    delete FRAGMENT_TABLE[this.$id];

    var pcs = FRAGMENT_TABLE[this.$parentId].$children,
        i = pcs.indexOf(this.$id);

    if (i > -1) {
        pcs.slice(i, 1);
    }
}