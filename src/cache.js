'use strict';

export default {
    hold: hold,
    release: release,
    get: get
}

var DATA = {},          // uuid => object data (whatever Model.loadFromRemote returns)
    HOLDING = false;

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

    // Then group the cache misses into classes. We can't use constructor.name since its not guaranteed to exist,
    // but we can compare constructors to check for class equivalence instead.
    var bucketHandles = [];
    var buckets = {};
    missed.forEach(function (model) {
        var thisHandle = model.constructor, i;
        for (i = 0; i < bucketHandles.length; i++) {
            if (bucketHandles[i] === thisHandle) break;
        }
        if (i == bucketHandles.length) {
            bucketHandles.push(thisHandle);
        }
    });
}
