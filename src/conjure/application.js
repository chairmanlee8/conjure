'use strict';

import Cache from './cache';
import Fragment from './fragment';

export default class Application extends Fragment {
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
