'use strict';

var xhr = require('xhr'),
    make_range = require('./utils/range'),
    Global = require('./global');

module.exports = {
    // Schedulers/batching
    hold: hold,
    release: release,

    // Immediate functions
    key: key,
    get: get,
    getAll: getAll,
    set: set,
    clear: clear,

    // Callback register
    waitFor: waitFor
}

// From the server DB, primary keys are stringified. If composite key, join with - (dash) in the declarative order
// .get retrieves items by key, return null for no data found
// .set sets item by key, will replace the whole object

var DATA = {},
    HOLD_QUEUE = [],
    HOLDING = 0,
    WAITERS = {},       // key -> [callback list]
    INFLIGHT = {};      // key -> {waiting: boolean, backoffTimer: timeout ID, nextBackoff: time|Infinity for permafail}

/**
 * Set the store into holding mode. This will defer any server request until release() is called.
 */
function hold () { 
    HOLDING++;
}

/**
 * Release the store from holding mode. Sends out any queued requests.
 */
function release () {
    HOLDING--;
    if (!HOLDING) {
        dispatch();
    }
}

/**
 * Register a callback to be called once when a resource returns.
 */
function waitFor (k, cb) {
    if (!WAITERS.hasOwnProperty(k)) {
        WAITERS[k] = [cb];
    } else {
        WAITERS[k].push(cb);
    }
}

/**
 * Creates a key-string from a data table/class and primary key. This key format is used throughout the Store.
 *
 * @param {string} table - A table name, must match __tablename__ from models.py.
 * @param {(number|number[])} pk - Primary key, or an array of keys if the primary key is composite. Must match the key order in the server URL router.
 *
 * @example key('user', 1) // "user-1"
 * @example key('enrollment', [1, 4]) // "enrollment-1-4"
 */
function key (table, pk) {
    if (Array.isArray(pk)) {
        return table + '-' + pk.join('-');
    } else {
        return table + '-' + pk;
    }
}

/**
 * Get an object from the data store. Guaranteed to return immediately (non-blocking). If an object is not found,
 * returns null, then depending on the state of the cache may or may not dispatch for the object from the server.
 *
 * WARNING: never use force=true inside a render() call, as this may dispatch API calls indefinitely!!
 * 
 * @param {string} k - Key (in the format provided by key(...)) of object to get.
 */
function get (k, force) {
    if (!DATA.hasOwnProperty(k) || force) {
        if (HOLD_QUEUE.indexOf(k) < 0) {
            HOLD_QUEUE.push(k);
        }

        if (!HOLDING) {
            dispatch();
        }

        // Return immediately
        return null;
    }
    return DATA[k];
}

function getAll (table) {
    // Just return all entries associated with table
    // Only works for single pk tables right now

    var t = {},
        ss = table + '-';

    for (var k in DATA) {
        if (k.indexOf(ss) == 0) {
            t[parseInt(k.slice(ss.length))] = DATA[k];
        }
    }

    return t;
}

function set (k, obj) {
    DATA[k] = obj;
}

function clear (k) {
    delete DATA[k];
}

//
// Communication functions
// TODO: abstract out the URL generation (for generic framework)

function dispatch () {
    var hq = HOLD_QUEUE.splice(0, HOLD_QUEUE.length),
        groups = {};

    // Group queue by baseObject
    hq.forEach(function (qk) {
        var parts = qk.split('-');

        // Discard invalid keys
        for (var i = 1; i < parts.length; i++) {
            parts[i] = parseInt(parts[i]);

            if (isNaN(parts[i]) || parts[i] < 0) {
                return;
            }
        }

        // Return if request for same resource already inflight OR backoff timer is running
        if (INFLIGHT.hasOwnProperty(qk)) {
            var iprops = INFLIGHT[qk];
            if (iprops.waiting || iprops.backoffTimer) {
                return;
            }
        }

        if (!groups.hasOwnProperty(parts[0])) {
            groups[parts[0]] = [parts.slice(1)];
        } else {
            groups[parts[0]].push(parts.slice(1));
        }
    });

    for (var baseObject in groups) {
        if (groups[baseObject].length == 1) {
            _dispatch1(baseObject, groups[baseObject][0]);
        } else if (groups[baseObject].length > 1) {
            _dispatch2(baseObject, groups[baseObject]);
        }
    }
}

function wait (k) {
    if (!INFLIGHT.hasOwnProperty(k)) {
        INFLIGHT[k] = {
            waiting: true,
            backoffTimer: null,
            nextBackoff: 1000
        };
    } else {
        INFLIGHT[k].waiting = true;
        INFLIGHT[k].backoffTimer = null;
    }
}

function backoff (k, cb) {
    INFLIGHT[k].waiting = true;
    INFLIGHT[k].backoffTimer = setTimeout(cb, INFLIGHT[k].nextBackoff);

    // Update backoff time
    INFLIGHT[k].nextBackoff *= 2;
    if (INFLIGHT[k].nextBackoff > (300 * 1000)) {
        // Hardfail after 5 minutes
        INFLIGHT[k].nextBackoff = Infinity;
    }
}

function callWaiters (k, result) {
    if (WAITERS.hasOwnProperty(k)) {
        var waiters = WAITERS[k].splice(0, WAITERS[k].length);
        for (var i in waiters) {
            waiters[i](result);
        }
    }
}

function _dispatch1 (baseObject, pk) {
    // Dispatch
    _doRequest(baseObject, pk);

    function _doRequest (baseObject, pk) {
        var k = key(baseObject, pk);
        wait(k);

        xhr({
            uri: '/' + baseObject + 's/' + pk.join('/'),
            method: 'GET'
        }, 
        function (err, resp, body) {
            if (resp.statusCode == 200) {
                var json = JSON.parse(body),
                    result = json.result;

                // Add to store
                INFLIGHT[k].waiting = false;
                set(k, result);

                // Call any waiters
                callWaiters(k, result);

                // Data updated, re-render
                Global.requestInvalidate();
            } else if (resp.statusCode == 404) {
                // Not found, officially set store to null
                INFLIGHT[k].waiting = false;
                set(k, null);
            } else {
                // Something weird happened, try again later
                if (INFLIGHT[k].nextBackoff !== Infinity) {
                    console.log(k + " will retry in " + INFLIGHT[k].nextBackoff + " ms.");
                    backoff(k, function () { _doRequest(baseObject, pk); });
                } else {
                    console.error(k + " has hardfailed.");
                    INFLIGHT[k].waiting = false;
                }
            }
        });
    }
}

function _dispatch2 (baseObject, pks) {
    // TODO: only works for single primary keys, what does make_range even mean for composite keys?
    _doRequest(baseObject, pks);

    function _doRequest (baseObject, pks) {
        var ks = pks.map(function (pk) { return key(baseObject, pk); }),
            pk_range = make_range(pks);

        // Wait all
        ks.forEach(wait);

        xhr({
            uri: '/' + baseObject + 's?ids=' + pk_range,
            method: 'GET'
        },
        function (err, resp, body) {
            if (resp.statusCode == 200) {
                var results = JSON.parse(body).result,
                    idsGot = [];

                results.forEach(function (result) {
                    var k = key(baseObject, result.id);
                    idsGot.push(k);

                    INFLIGHT[k].waiting = false;
                    set(k, result);
                });

                // For missing ids just mark as 404 since we don't really know what happens (TODO)
                for (var i in ks) {
                    INFLIGHT[ks[i]].waiting = false;

                    if (idsGot.indexOf(ks[i]) < 0) {
                        set(ks[i], null);
                    }
                }

                // Call waiters and invalidate
                for (var i in idsGot) {
                    callWaiters(idsGot[i], DATA[idsGot[i]]);
                }

                Global.requestInvalidate();
            } else {
                // Mark all as missing since we don't really know what happens (TODO)
                for (var i in ks) {
                    INFLIGHT[ks[i]].waiting = false;
                    set(ks[i], null);
                }
            }
        });
    }
}