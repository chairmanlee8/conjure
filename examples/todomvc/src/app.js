/** @jsx h */
'use strict';

import h from 'virtual-dom/h';
import Global from 'conjure/global';
import Cache from 'conjure/cache';

class TodoMVC {
    render () {
        return <section className="todoapp">
            <header className="header">
                <h1>todos</h1>
            </header>
        </section>;
    }
}

// Bind application to window object so we can inspect stuff from console
// Other than for that reason, it's totally unnecessary
window.app = new TodoMVC();
Global.start(window.app);
