import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';

export default {
    start: start,
    swap: swap,
    requestInvalidate: requestInvalidate,       // Instead, use requestInvalidate to schedule an invalidate
    getApplication: getApplication,             // Get registered application
    nextTick: nextTick,                         // Register a callback to call once after the next render/invalidate
    debugPerformance: debugPerformance          // Toggle performance logging
}

var G_APP = null,
    G_TREE = null,
    G_ROOT = null,
    G_READY = false,
    G_NEXT_TICK = [],
    G_LOG_PERF = false;

// Should only be called once!
function start (app) {
    G_APP = app;
    G_TREE = G_APP.renderWithCache();
    G_ROOT = createElement(G_TREE);
    document.body.appendChild(G_ROOT);
    G_READY = true;
    invalidate();
}

function swap (app) {
    G_APP = app;
    requestInvalidate();
}

function debugPerformance (flag) {
    G_LOG_PERF = flag;
}

function getApplication () {
    return G_APP;
}

function invalidate () {
    var t0, t1, t2, t3, newTree, patches;

    // Do not call until start() has been called
    if (!G_READY) {
        return;
    }

    t0 = performance.now(); newTree = G_APP.renderWithCache();
    t1 = performance.now(); patches = diff(G_TREE, newTree);
    t2 = performance.now(); G_ROOT = patch(G_ROOT, patches);
    t3 = performance.now(); G_TREE = newTree;

    // Call all next tick waiters
    var tickers = G_NEXT_TICK.slice(0);     // copy array
    G_NEXT_TICK.length = 0;                 // clear original
    tickers.map(function (fn) { fn() });

    // Display performance stats
    if (G_LOG_PERF) {
        console.log(
            "Render: " + (t1-t0).toFixed(2) + "ms. " +
            "Diff: " + (t2-t1).toFixed(2) + "ms. " +
            "Patch: " + (t3-t2).toFixed(2) + "ms."
        );
    }
}

function nextTick (fn) {
    G_NEXT_TICK.push(fn);
}

function requestInvalidate () {
    window.requestAnimationFrame(invalidate);
}
