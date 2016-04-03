'use strict';

import Cache from './cache';

export default class Application {
    renderWithCache () {
        Cache.hold();
        var r = this.render();
        Cache.release();
        return r;
    }

    render () {
        return null;
    }
}
