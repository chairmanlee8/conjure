/**
 * Simple URL router.
 *
 * @module framework/router
 */

'use strict';

export default {
    configure: configure,
    getCurrentPage: getCurrentPage,
    go: go,
    back: back,
    forward: forward,
    onChange: onChange
}

var CONFIG = [];
var CURRENT_STATE = null;
var CHANGE_FN = null;

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
        // Reverse the current window location, warn if URL would not be captured
        if (!apply()) {
            console.error("Warning: the current URL would not have been captured under the current Router configuration.");
        }
    }

    // Hook into onpopstate
    window.addEventListener("popstate", function (ev) {
        if (!apply()) {
            window.location.reload();
        }
    });

    // Hook into a link clicks
    document.addEventListener('click', function (ev) {
        if (ev.target.tagName !== 'A') return;

        if (ev.target.protocol === window.location.protocol &&
            ev.target.hostname === window.location.hostname &&
            ev.target.port === window.location.port)
        {
            go(ev.target.href);

            // Stay on this single page
            ev.preventDefault();
            return false;
        }
    }, false);
}

/**
 * Parse the current window location/path and update the Router state.
 */
function apply () {
    var matched = false,
        url = window.location.pathname,
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
                if (CHANGE_FN) {
                    CHANGE_FN(CONFIG[i].page, args);
                }

                matched = true;
                break;
            }
        }
    }

    return matched;
}

/**
 * Navigate to the specified URL in a Router-friendly way (if you set window.location directly, the destination will not
 * be parsed and checked for capture. If the destination is captured by one of the configured URL patterns, Router will
 * intercept it and trigger the onChange event; otherwise it will navigate to the destination.
 *
 * @param {string} href - Destination link.
 */
function go (href) {
    // Update history
    history.pushState({}, '', href);
    if (!apply()) {
        window.location.reload();
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

/**
 * Get what Router thinks the current page is.
 */
function getCurrentPage () {
    return CURRENT_STATE;
}

/**
 * Hook into URL change event.
 */
function onChange (fn) {
    CHANGE_FN = fn;
}
