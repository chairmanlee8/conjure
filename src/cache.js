'use strict';

export default {
    hold: hold,
    release: release,
    get: get,
    set: set
}

var DATA = {},          // uuid => object data (whatever Model.loadFromRemote returns)
    HOLDING = false,
    HOLD_QUEUE = [];

function get (...models) {
    // First return anything that's cached
    var missed = [];
    models.forEach(function (model) {
        if (model.uuid && DATA.hasOwnProperty(model.uuid)) {
            model.onLoad(DATA[model.uuid]);
        } else {
            missed.push(model);
        }
    });

    if (HOLDING) {
        // Holding, just push back everything to the hold queue.
        HOLD_QUEUE = HOLD_QUEUE.concat(missed);
    } else {
        processQueue(missed);
    }
}

function set(model, cacheArgs) {
    DATA[model.uuid] = cacheArgs;
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
    });

    // Load from remote
    bucketHandles.forEach(function (cls, i) {
        cls.loadFromRemote(...buckets[i]);
    });
}
