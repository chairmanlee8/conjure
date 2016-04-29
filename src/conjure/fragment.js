'use strict';

export default class Fragment {
    constructor () {
        this.$uuid = `fragment-${Fragment.ID_COUNTER}`;
        Fragment.ID_COUNTER++;
    }

    get uuid () {
        return this.$uuid;
    }

    render () {
        return null;
    }

    /**
     * Generic event handler. Turns class methods into closures that can be used as event handlers. If you need to use
     * data from the event object, or have access to the event object in general, use handleEvent instead.
     *
     * For non class methods (or methods that call into a different `this`, use framework/utils/handle).
     */
    handle (fn, args=[], final=false) {
        var self = this;

        return function (ev) {
            fn.apply(self, args);

            if (final) {
                ev.preventDefault();
                ev.stopPropagation();
                return false;
            }
        }
    }
}

Fragment.ID_COUNTER = 1;
