(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _router = require('router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hereSpan = document.getElementById('Here');

_router2.default.configure([{ pattern: "/", page: "root" }, { pattern: "/hello", page: "hello" }, { pattern: "/world", page: "world" }]);

_router2.default.onChange(function (page, args) {
    hereSpan.innerText = page;
});

},{"router":2}],2:[function(require,module,exports){
/**
 * Simple URL router.
 *
 * @module framework/router
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    configure: configure,
    getCurrentPage: getCurrentPage,
    go: go,
    back: back,
    forward: forward,
    onChange: onChange
};


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
function configure(urls, noinit) {
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

        if (ev.target.protocol === window.location.protocol && ev.target.hostname === window.location.hostname && ev.target.port === window.location.port) {
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
function apply() {
    var matched = false,
        url = window.location.pathname,
        urlParts = url.split('/').slice(1); // slice(1) to get rid of initial slash /

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
                CURRENT_STATE = { "route": CONFIG[i].page, "args": args };
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
function go(href) {
    // Update history
    history.pushState({}, '', href);
    if (!apply()) {
        window.location.reload();
    }
}

/**
 * Alias for window.history.back()
 */
function back() {
    // Go back (History:popState)
    window.history.back();
}

/**
 * Alias for window.history.forward()
 */
function forward() {
    // Go forward if possible
    window.history.forward();
}

/**
 * Get what Router thinks the current page is.
 */
function getCurrentPage() {
    return CURRENT_STATE;
}

/**
 * Hook into URL change event.
 */
function onChange(fn) {
    CHANGE_FN = fn;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlc1xccm91dGVyXFxhcHAuanMiLCJzcmNcXHJvdXRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQUVBLElBQUksV0FBVyxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBWDs7QUFFSixpQkFBTyxTQUFQLENBQWlCLENBQ2IsRUFBQyxTQUFTLEdBQVQsRUFBYyxNQUFNLE1BQU4sRUFERixFQUViLEVBQUMsU0FBUyxRQUFULEVBQW1CLE1BQU0sT0FBTixFQUZQLEVBR2IsRUFBQyxTQUFTLFFBQVQsRUFBbUIsTUFBTSxPQUFOLEVBSFAsQ0FBakI7O0FBTUEsaUJBQU8sUUFBUCxDQUFnQixVQUFVLElBQVYsRUFBZ0IsSUFBaEIsRUFBc0I7QUFDbEMsYUFBUyxTQUFULEdBQXFCLElBQXJCLENBRGtDO0NBQXRCLENBQWhCOzs7Ozs7Ozs7QUNKQTs7Ozs7a0JBRWU7QUFDWCxlQUFXLFNBQVg7QUFDQSxvQkFBZ0IsY0FBaEI7QUFDQSxRQUFJLEVBQUo7QUFDQSxVQUFNLElBQU47QUFDQSxhQUFTLE9BQVQ7QUFDQSxjQUFVLFFBQVY7Ozs7QUFHSixJQUFJLFNBQVMsRUFBVDtBQUNKLElBQUksZ0JBQWdCLElBQWhCO0FBQ0osSUFBSSxZQUFZLElBQVo7Ozs7Ozs7Ozs7QUFVSixTQUFTLFNBQVQsQ0FBb0IsSUFBcEIsRUFBMEIsTUFBMUIsRUFBa0M7Ozs7O0FBSzlCLGFBQVMsSUFBVCxDQUw4Qjs7QUFPOUIsUUFBSSxDQUFDLE1BQUQsRUFBUzs7QUFFVCxZQUFJLENBQUMsT0FBRCxFQUFVO0FBQ1Ysb0JBQVEsS0FBUixDQUFjLCtGQUFkLEVBRFU7U0FBZDtLQUZKOzs7QUFQOEIsVUFlOUIsQ0FBTyxnQkFBUCxDQUF3QixVQUF4QixFQUFvQyxVQUFVLEVBQVYsRUFBYztBQUM5QyxZQUFJLENBQUMsT0FBRCxFQUFVO0FBQ1YsbUJBQU8sUUFBUCxDQUFn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LElBQTFCLEVBRmU7QUFHZixRQUFJLENBQUMsT0FBRCxFQUFVO0FBQ1YsZUFBTyxRQUFQLENBQWdCLE1BQWhCLEdBRFU7S0FBZDtDQUhKOzs7OztBQVdBLFNBQVMsSUFBVCxHQUFpQjs7QUFFYixXQUFPLE9BQVAsQ0FBZSxJQUFmLEdBRmE7Q0FBakI7Ozs7O0FBUUEsU0FBUyxPQUFULEdBQW9COztBQUVoQixXQUFPLE9BQVAsQ0FBZSxPQUFmLEdBRmdCO0NBQXBCOzs7OztBQVFBLFNBQVMsY0FBVCxHQUEyQjtBQUN2QixXQUFPLGFBQVAsQ0FEdUI7Q0FBM0I7Ozs7O0FBT0EsU0FBUyxRQUFULENBQW1CLEVBQW5CLEVBQXVCO0FBQ25CLGdCQUFZLEVBQVosQ0FEbUI7Q0FBdkIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJvdXRlciBmcm9tICdyb3V0ZXInO1xyXG5cclxudmFyIGhlcmVTcGFuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ0hlcmUnKTtcclxuXHJcblJvdXRlci5jb25maWd1cmUoW1xyXG4gICAge3BhdHRlcm46IFwiL1wiLCBwYWdlOiBcInJvb3RcIn0sXHJcbiAgICB7cGF0dGVybjogXCIvaGVsbG9cIiwgcGFnZTogXCJoZWxsb1wifSxcclxuICAgIHtwYXR0ZXJuOiBcIi93b3JsZFwiLCBwYWdlOiBcIndvcmxkXCJ9XHJcbl0pO1xyXG5cclxuUm91dGVyLm9uQ2hhbmdlKGZ1bmN0aW9uIChwYWdlLCBhcmdzKSB7XHJcbiAgICBoZXJlU3Bhbi5pbm5lclRleHQgPSBwYWdlO1xyXG59KTtcclxuIiwiLyoqXHJcbiAqIFNpbXBsZSBVUkwgcm91dGVyLlxyXG4gKlxyXG4gKiBAbW9kdWxlIGZyYW1ld29yay9yb3V0ZXJcclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBjb25maWd1cmU6IGNvbmZpZ3VyZSxcclxuICAgIGdldEN1cnJlbnRQYWdlOiBnZXRDdXJyZW50UGFnZSxcclxuICAgIGdvOiBnbyxcclxuICAgIGJhY2s6IGJhY2ssXHJcbiAgICBmb3J3YXJkOiBmb3J3YXJkLFxyXG4gICAgb25DaGFuZ2U6IG9uQ2hhbmdlXHJcbn1cclxuXHJcbnZhciBDT05GSUcgPSBbXTtcclxudmFyIENVUlJFTlRfU1RBVEUgPSBudWxsO1xyXG52YXIgQ0hBTkdFX0ZOID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmUgVVJMIHJvdXRlcy4gVVJMIHJvdXRlIHBhdHRlcm5zIHVzZSBjdXJseSBicmFja2V0cyB0byBjYXB0dXJlIGFyZ3VtZW50cywgYnV0IGJlIGNhcmVmdWwgYXMgcXVlcnktc3RyaW5nXHJcbiAqIHRlcm1zIHdpbGwgb3ZlcndyaXRlIGFueSBjYXB0dXJlcyBpZiB0aGV5IHNoYXJlIHRoZSBzYW1lIG5hbWUgKGkuZS4gL2hvbWUvcGFnZS97dXNlcn0gcGF0dGVybiwgd2hlbiBtYXRjaGVkIHdpdGhcclxuICogL2hvbWUvcGFnZS8xIHdvdWxkIGNhcHR1cmUgdXNlcj0xLCBidXQgd2hlbiBtYXRjaGVkIHdpdGggL2hvbWUvcGFnZS8xP3VzZXI9MyB3aWxsIGNhcHR1cmUgdXNlcj0zKVxyXG4gKlxyXG4gKiBAcGFyYW0ge1ttYXRjaFNwZWNdfSB1cmxzIC0gVVJMIHJvdXRlIHBhdHRlcm5zXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9pbml0IC0gaWYgdHJ1ZSwgZG8gbm8gY2FsbCBvbkNoYW5nZSBpbW1lZGlhdGVseSB1c2luZyB0aGUgY3VycmVudCB3aW5kb3cubG9jYXRpb25cclxuICovXHJcbmZ1bmN0aW9uIGNvbmZpZ3VyZSAodXJscywgbm9pbml0KSB7XHJcbiAgICAvLyB1cmxzID0+IFt7cGF0dGVybjosIHBhZ2U6fV1cclxuICAgIC8vIHdoZXJlIHBhdHRlcm4gaXMgYSBwYXRoIHRvIG1hdGNoIHdpdGggdXNpbmcgc2ltcGxpZmllZCBjdXJseSBzeW50YXggZS5nLiAvaG9tZS9wYWdlL3t1c2VySWR9XHJcbiAgICAvLyBpZiBub2luaXQgPSB0cnVlLCB0aGVuIGRvIG5vdCBjYWxsIG9uQ2hhbmdlIGltbWVkaWF0ZWx5IHVzaW5nIHRoZSBjdXJyZW50IHdpbmRvdy5sb2NhdGlvblxyXG5cclxuICAgIENPTkZJRyA9IHVybHM7XHJcblxyXG4gICAgaWYgKCFub2luaXQpIHtcclxuICAgICAgICAvLyBSZXZlcnNlIHRoZSBjdXJyZW50IHdpbmRvdyBsb2NhdGlvbiwgd2FybiBpZiBVUkwgd291bGQgbm90IGJlIGNhcHR1cmVkXHJcbiAgICAgICAgaWYgKCFhcHBseSgpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJXYXJuaW5nOiB0aGUgY3VycmVudCBVUkwgd291bGQgbm90IGhhdmUgYmVlbiBjYXB0dXJlZCB1bmRlciB0aGUgY3VycmVudCBSb3V0ZXIgY29uZmlndXJhdGlvbi5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhvb2sgaW50byBvbnBvcHN0YXRlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIGZ1bmN0aW9uIChldikge1xyXG4gICAgICAgIGlmICghYXBwbHkoKSkge1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSG9vayBpbnRvIGEgbGluayBjbGlja3NcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2KSB7XHJcbiAgICAgICAgaWYgKGV2LnRhcmdldC50YWdOYW1lICE9PSAnQScpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKGV2LnRhcmdldC5wcm90b2NvbCA9PT0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICYmXHJcbiAgICAgICAgICAgIGV2LnRhcmdldC5ob3N0bmFtZSA9PT0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICYmXHJcbiAgICAgICAgICAgIGV2LnRhcmdldC5wb3J0ID09PSB3aW5kb3cubG9jYXRpb24ucG9ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdvKGV2LnRhcmdldC5ocmVmKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0YXkgb24gdGhpcyBzaW5nbGUgcGFnZVxyXG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgZmFsc2UpO1xyXG59XHJcblxyXG4vKipcclxuICogUGFyc2UgdGhlIGN1cnJlbnQgd2luZG93IGxvY2F0aW9uL3BhdGggYW5kIHVwZGF0ZSB0aGUgUm91dGVyIHN0YXRlLlxyXG4gKi9cclxuZnVuY3Rpb24gYXBwbHkgKCkge1xyXG4gICAgdmFyIG1hdGNoZWQgPSBmYWxzZSxcclxuICAgICAgICB1cmwgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUsXHJcbiAgICAgICAgdXJsUGFydHMgPSB1cmwuc3BsaXQoJy8nKS5zbGljZSgxKTsgICAgIC8vIHNsaWNlKDEpIHRvIGdldCByaWQgb2YgaW5pdGlhbCBzbGFzaCAvXHJcblxyXG4gICAgZm9yICh2YXIgaSBpbiBDT05GSUcpIHtcclxuICAgICAgICB2YXIgbWF0Y2hQYXJ0cyA9IENPTkZJR1tpXS5wYXR0ZXJuLnNwbGl0KCcvJykuc2xpY2UoMSk7XHJcblxyXG4gICAgICAgIGlmICh1cmxQYXJ0cy5sZW5ndGggPT09IG1hdGNoUGFydHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrIHBhcnQgYnkgcGFydCwgd2hlcmUgY3VybHkgYXJncyBtYXRjaCBhbnl0aGluZ1xyXG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXJncyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB1cmxQYXJ0cy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKC9eXFx7LipcXH0kLy50ZXN0KG1hdGNoUGFydHNbal0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRnJlZSBhcmd1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbbWF0Y2hQYXJ0c1tqXS5zbGljZSgxLCAtMSldID0gdXJsUGFydHNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1hdGNoUGFydHNbal0gPT09IHVybFBhcnRzW2pdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRm91bmQgbWF0Y2gsIGFkZCBhbnkgc2VhcmNoIGFyZ3MgZnJvbSB3aW5kb3cubG9jYXRpb24uc2VhcmNoXHJcbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoVGVybXMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLmxlbmd0aCA+IDAgPyB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnNsaWNlKDEpLnNwbGl0KCcmJykgOiBbXTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaFRlcm1zLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdHAgPSB0LnNwbGl0KCc9Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnc1t0cFswXV0gPSBkZWNvZGVVUkkodHBbMV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGN1cnJlbnQgc3RhdGUgYW5kIHRyaWdnZXIgb25DaGFuZ2VcclxuICAgICAgICAgICAgICAgIENVUlJFTlRfU1RBVEUgPSB7XCJyb3V0ZVwiOiBDT05GSUdbaV0ucGFnZSwgXCJhcmdzXCI6IGFyZ3N9O1xyXG4gICAgICAgICAgICAgICAgaWYgKENIQU5HRV9GTikge1xyXG4gICAgICAgICAgICAgICAgICAgIENIQU5HRV9GTihDT05GSUdbaV0ucGFnZSwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbWF0Y2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWF0Y2hlZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE5hdmlnYXRlIHRvIHRoZSBzcGVjaWZpZWQgVVJMIGluIGEgUm91dGVyLWZyaWVuZGx5IHdheSAoaWYgeW91IHNldCB3aW5kb3cubG9jYXRpb24gZGlyZWN0bHksIHRoZSBkZXN0aW5hdGlvbiB3aWxsIG5vdFxyXG4gKiBiZSBwYXJzZWQgYW5kIGNoZWNrZWQgZm9yIGNhcHR1cmUuIElmIHRoZSBkZXN0aW5hdGlvbiBpcyBjYXB0dXJlZCBieSBvbmUgb2YgdGhlIGNvbmZpZ3VyZWQgVVJMIHBhdHRlcm5zLCBSb3V0ZXIgd2lsbFxyXG4gKiBpbnRlcmNlcHQgaXQgYW5kIHRyaWdnZXIgdGhlIG9uQ2hhbmdlIGV2ZW50OyBvdGhlcndpc2UgaXQgd2lsbCBuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmIC0gRGVzdGluYXRpb24gbGluay5cclxuICovXHJcbmZ1bmN0aW9uIGdvIChocmVmKSB7XHJcbiAgICAvLyBVcGRhdGUgaGlzdG9yeVxyXG4gICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBocmVmKTtcclxuICAgIGlmICghYXBwbHkoKSkge1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB3aW5kb3cuaGlzdG9yeS5iYWNrKClcclxuICovXHJcbmZ1bmN0aW9uIGJhY2sgKCkge1xyXG4gICAgLy8gR28gYmFjayAoSGlzdG9yeTpwb3BTdGF0ZSlcclxuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB3aW5kb3cuaGlzdG9yeS5mb3J3YXJkKClcclxuICovXHJcbmZ1bmN0aW9uIGZvcndhcmQgKCkge1xyXG4gICAgLy8gR28gZm9yd2FyZCBpZiBwb3NzaWJsZVxyXG4gICAgd2luZG93Lmhpc3RvcnkuZm9yd2FyZCgpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHdoYXQgUm91dGVyIHRoaW5rcyB0aGUgY3VycmVudCBwYWdlIGlzLlxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Q3VycmVudFBhZ2UgKCkge1xyXG4gICAgcmV0dXJuIENVUlJFTlRfU1RBVEU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIb29rIGludG8gVVJMIGNoYW5nZSBldmVudC5cclxuICovXHJcbmZ1bmN0aW9uIG9uQ2hhbmdlIChmbikge1xyXG4gICAgQ0hBTkdFX0ZOID0gZm47XHJcbn1cclxuIl19
