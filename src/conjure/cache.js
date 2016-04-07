import Global from './global';

export default {
    hold: hold,
    release: release,
    get: get,
    set: set,
    invalidate: invalidate,
    waitFor: waitFor,

    // Debugging hooks
    _inspect: _inspect
}

var DATA = {},              // uuid => {stale: false/true, value: object data (whatever Model.loadFromRemote returns)}
    HOLDING = false,
    HOLD_QUEUE = [],
    INFLIGHT = new Set(),
    WAITERS = {};           // uuid => fn

function _inspect () {
    return DATA;
}

function waitFor (model, fn) {
    if (!WAITERS.hasOwnProperty(model.uuid)) {
        WAITERS[model.uuid] = [];
    }
    WAITERS[model.uuid].push(fn);
}

function callWaiters (model) {
    if (WAITERS.hasOwnProperty(model.uuid)) {
        let waiters = WAITERS[model.uuid].slice();
        WAITERS[model.uuid].length = 0;
        waiters.forEach(fn => fn());
    }
}

/**
 * TODO: Default behavior is to look at DATA::valid and return stale data anyways (while dispatching to remote).
 * Perhaps we can add a strict mode to never return stale data, but what would be the point?
 */
function get (...models) {
    // First return anything that's cached
    var missed = new Set();
    models.forEach(function (model) {
        if (!model.$local) {
            if (model.uuid && DATA.hasOwnProperty(model.uuid)) {
                model.fromCache(DATA[model.uuid].value);
                callWaiters(model);

                if (DATA[model.uuid].stale) {
                    missed.add(model);
                }
            } else {
                missed.add(model);
            }
        }
    });

    // Filter missed by excluding uuid's already inflight
    let needs = new Set([...missed].filter(x => !INFLIGHT.has(x.uuid)));

    if (HOLDING) {
        // Holding, just push back everything to the hold queue.
        HOLD_QUEUE = HOLD_QUEUE.concat([...needs]);
    } else {
        processQueue([...needs]);
    }
}

function set (model, cacheArgs) {
    DATA[model.uuid] = {stale: false, value: cacheArgs};
    INFLIGHT.delete(model.uuid);
}

function invalidate (model) {
    if (DATA.hasOwnProperty(model.uuid)) {
        DATA[model.uuid].stale = true;
    }
}

function hold () {
    HOLDING = true;
}

function release () {
    HOLDING = false;
    if (HOLD_QUEUE.length > 0) {
        var models = HOLD_QUEUE.slice(0);
        HOLD_QUEUE.length = 0;
        processQueue(models);
    }
}

function processQueue(models) {
    // Group the models into classes. We can't use constructor.name since its not guaranteed to exist,
    // but we can compare constructors to check for class equivalence instead.
    var bucketHandles = [];
    var buckets = {};

    models.forEach(function (model) {
        var thisHandle = model.constructor, i;
        for (i = 0; i < bucketHandles.length; i++) {
            if (bucketHandles[i] === thisHandle) break;
        }

        if (i == bucketHandles.length) {
            bucketHandles.push(thisHandle);
            buckets[i] = [model];
        } else {
            buckets[i].push(model);
        }

        // Add to INFLIGHT set
        INFLIGHT.add(model.uuid);
    });

    // Load from remote then invalidate
    Promise.all(bucketHandles.map((cls, i) => cls.loadFromRemote(...buckets[i]))).then(() => {
        // For all models that are loaded, call waiters
        models.forEach(model => {
            if (model.$loaded) {
                callWaiters(model);
            }
        });

        Global.requestInvalidate();
    });
}
