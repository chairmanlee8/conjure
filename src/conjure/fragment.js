'use strict';

export default class Fragment {
    render () {
        return null;
    }

    /**
     * Generic event handler. Turns class methods into closures that can be used as event handlers. If you need to use
     * data from the event object, or have access to the event object in general, use handleEvent instead.
     *
     * For non class methods (or methods that call into a different `this`, use framework/utils/handle).
     */
    handle (fn, final=false, args) {
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
