// Framework main file

var diff = require('virtual-dom/diff'),
    patch = require('virtual-dom/patch'),
    createElement = require('virtual-dom/create-element');

module.exports = {
    app: null,                                  // Top level module, set by application entry point
    start: start,
    invalidate: invalidate,                     // Do NOT call this inside a render call, it will start a race condition
    requestInvalidate: requestInvalidate,       // Instead, use requestInvalidate to schedule an invalidate
    post: post,                                 // Post to message queue
    on: on,                                     // Register a message queue callback

    // DEPRECATED
    alert: deadend,
    prompt: deadend,
    confirm: deadend
}

G_TREE = null;
G_ROOT = null;
G_READY = false;
G_QUEUE = [];
G_CALLBACKS = {};

function deadend () {
    console.error("Not implemented.");
}

function invalidate () {
    var t0, t1, t2, t3, newTree, patches;

    // Do not call until start() has been called
    if (!G_READY) {
        return;
    }

    t0 = performance.now();     newTree = module.exports.app.render();
    t1 = performance.now();     patches = diff(G_TREE, newTree);
    t2 = performance.now();     G_ROOT = patch(G_ROOT, patches);
    t3 = performance.now();     G_TREE = newTree;

    // Display performance stats
    console.log(
        "Render: " + (t1-t0).toFixed(2) + "ms. " +
        "Diff: " + (t2-t1).toFixed(2) + "ms. " +
        "Patch: " + (t3-t2).toFixed(2) + "ms."
    );
}

function requestInvalidate () {
    window.requestAnimationFrame(invalidate);
}

// Should only be called once!
function start () {
    G_TREE = module.exports.app.render();
    G_ROOT = createElement(G_TREE);
    document.body.appendChild(G_ROOT);
    G_READY = true;
}

function post (msg, data) {
    G_QUEUE.push([msg, data]);

    setTimeout(function () {
        consumeQueue();
    }, 0);
}

function on (msg, cb) {
    if (G_CALLBACKS.hasOwnProperty(msg)) {
        G_CALLBACKS[msg].push(cb);
    } else {
        G_CALLBACKS[msg] = [cb];
    }
}

function consumeQueue () {
    G_QUEUE.forEach(function (ab) {
        if (G_CALLBACKS.hasOwnProperty(ab[0])) {
            var qs = G_CALLBACKS[ab[0]].slice(0);

            qs.forEach(function (q) {
                q(ab[1]);
            });
        }
    });

    G_QUEUE.length = 0;
}