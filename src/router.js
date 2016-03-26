/**
 * Simple URL router.
 *
 * @module framework/router
 */

'use strict';

export default {
    configure: configure,
    getCurrent: getCurrent,
    set: set,
    go: set,                  // alias for set()
    back: back,
    forward: forward,
    onChange: null
}

var CONFIG = [];
var CURRENT_STATE = null;

function getCurrent () {
    return CURRENT_STATE;
}

/**
 * Configure URL routes. URL route patterns use curly brackets to capture arguments, but be careful as query-string
 * terms will overwrite any captures if they share the same name (i.e. /home/page/{user} pattern, when matched with
 * /home/page/1 would capture user=1, but when matched with /home/page/1?user=3 will capture user=3)
 *
 * @param {[matchSpec]} urls - URL route patterns
 * @param {boolean} noinit - if true, do no call onChange immediately using the current window.location
 */
function configure (urls, noinit) {
    // urls => [{pattern:, page:}]
    // where pattern is a path to match with using simplified curly syntax e.g. /home/page/{userId}
    // if noinit = true, then do not call onChange immediately using the current window.location

    CONFIG = urls;

    if (!noinit) {
        // Reverse the current window location
        apply();
    }

    // Hook into onpopstate
    window.addEventListener("popstate", function (ev) {
        apply();
    });

    // Hook into a link clicks
    document.addEventListener('click', function (ev) {
        if (ev.target.tagName !== 'A') return;

        console.log(ev.target.href);
        ev.preventDefault();
        return false;
    }, false);
}

/**
 * Parse the current window location/path and update the Router state.
 */
function apply () {
    var url = window.location.pathname,
        urlParts = url.split('/').slice(1);     // slice(1) to get rid of initial slash /

    for (var i in CONFIG) {
        var matchParts = CONFIG[i].pattern.split('/').slice(1);

        if (urlParts.length === matchParts.length) {
            // Check part by part, where curly args match anything
            var match = true,
                args = {};

            for (var j = 0; j < urlParts.length; j++) {
                if (/^\{.*\}$/.test(matchParts[j])) {
                    // Free argument
                    args[matchParts[j].slice(1, -1)] = urlParts[j];
                    continue;
                } else if (matchParts[j] === urlParts[j]) {
                    continue;
                } else {
                    match = false;
                    break;
                }
            }

            if (match) {
                // Found match, add any search args from window.location.search
                var searchTerms = window.location.search.length > 0 ? window.location.search.slice(1).split('&') : [];
                searchTerms.forEach(function (t) {
                    var tp = t.split('=');
                    args[tp[0]] = decodeURI(tp[1]);
                });

                // Update current state and trigger onChange
                CURRENT_STATE = {"route": CONFIG[i].page, "args": args};
                if (module.exports.onChange) {
                    module.exports.onChange(CONFIG[i].page, args);
                }

                break;
            }
        }
    }
}

/**
 * Navigate to the specified page with the supplied arguments. Will add a history entry and call onChange if configured.
 * Page names are defined in the configure() call.
 *
 * @param {string} page - Page name as defined in configuration.
 * @param {Object} [args] - Arguments/parameter for the page.
 * @param {string} [title] - Set window title on page transition.
 */
function set (page, args, title) {
    for (var i in CONFIG) {
        if (CONFIG[i].page === page) {
            var url = CONFIG[i].pattern.slice(),
                uncaptured = [];        // uncaptured arguments

            // Replace curly args
            for (var arg in args) {
                var argRe = new RegExp("\\{" + arg + "\\}", 'g');

                if (url.search(argRe) > -1) {
                    url = url.replace(argRe, args[arg]);
                } else {
                    uncaptured.push(arg + "=" + encodeURI(args[arg]));
                    args[arg] = String(args[arg]);
                }
            }

            // Check for missing args
            if (url.search(/\{.*\}/) > -1) {
                // Soft-fail
                console.error("Incomplete arguments in navigation request.");
                return;
            }

            // Add any uncaptured arguments into the search field
            if (uncaptured.length > 0) {
                url += "?" + uncaptured.join('&');
            }

            // Update history
            history.pushState({}, '', url);
            if (title) { document.title = title; }

            CURRENT_STATE = {"route": page, "args": args};
            if (module.exports.onChange) {
                module.exports.onChange(page, args);
            }

            break;
        }
    }
}

/**
 * Alias for window.history.back()
 */
function back () {
    // Go back (History:popState)
    window.history.back();
}

/**
 * Alias for window.history.forward()
 */
function forward () {
    // Go forward if possible
    window.history.forward();
}