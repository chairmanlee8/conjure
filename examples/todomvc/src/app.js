/** @jsx h */
'use strict';

import h from 'virtual-dom/h';
import Global from 'conjure/global';
import Application from 'conjure/application';
import Cache from 'conjure/cache';

class TodoMVC extends Application {
    render () {
        return <div>
            <section className="todoapp">
                <header className="header">
                    <h1>todos</h1>
                    <input className="new-todo" placeholder="What needs to be done?" autofocus />
                </header>
            </section>

            <footer className="info">
                <p>Double-click to edit a todo</p>
                <p>Created for Conjure</p>
                <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
            </footer>
        </div>;
    }
}

// Bind application to window object so we can inspect stuff from console
// Other than for that reason, it's totally unnecessary
window.app = new TodoMVC();
Global.start(window.app);
