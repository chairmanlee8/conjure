(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _router = require('router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hereSpan = document.getElementById('Here');

_router2.default.configure([{ pattern: "/", page: "root" }, { pattern: "/hello", page: "hello" }, { pattern: "/world", page: "world" }]);

_router2.default.onChange = function (page, args) {
    console.log(page);
    console.log(args);
};

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
    getCurrent: getCurrent,
    set: set,
    go: set, // alias for set()
    back: back,
    forward: forward,
    onChange: null
};


var CONFIG = [];
var CURRENT_STATE = null;

function getCurrent() {
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
function configure(urls, noinit) {
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
function apply() {
    var url = window.location.pathname,
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
function set(page, args, title) {
    for (var i in CONFIG) {
        if (CONFIG[i].page === page) {
            var url = CONFIG[i].pattern.slice(),
                uncaptured = []; // uncaptured arguments

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
            if (title) {
                document.title = title;
            }

            CURRENT_STATE = { "route": page, "args": args };
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlc1xccm91dGVyXFxhcHAuanMiLCJzcmNcXHJvdXRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQUVBLElBQUksV0FBVyxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBWDs7QUFFSixpQkFBTyxTQUFQLENBQWlCLENBQ2IsRUFBQyxTQUFTLEdBQVQsRUFBYyxNQUFNLE1BQU4sRUFERixFQUViLEVBQUMsU0FBUyxRQUFULEVBQW1CLE1BQU0sT0FBTixFQUZQLEVBR2IsRUFBQyxTQUFTLFFBQVQsRUFBbUIsTUFBTSxPQUFOLEVBSFAsQ0FBakI7O0FBTUEsaUJBQU8sUUFBUCxHQUFrQixVQUFVLElBQVYsRUFBZ0IsSUFBaEIsRUFBc0I7QUFDcEMsWUFBUSxHQUFSLENBQVksSUFBWixFQURvQztBQUVwQyxZQUFRLEdBQVIsQ0FBWSxJQUFaLEVBRm9DO0NBQXRCOzs7Ozs7Ozs7QUNKbEI7Ozs7O2tCQUVlO0FBQ1gsZUFBVyxTQUFYO0FBQ0EsZ0JBQVksVUFBWjtBQUNBLFNBQUssR0FBTDtBQUNBLFFBQUksR0FBSjtBQUNBLFVBQU0sSUFBTjtBQUNBLGFBQVMsT0FBVDtBQUNBLGNBQVUsSUFBVjs7OztBQUdKLElBQUksU0FBUyxFQUFUO0FBQ0osSUFBSSxnQkFBZ0IsSUFBaEI7O0FBRUosU0FBUyxVQUFULEdBQXVCO0FBQ25CLFdBQU8sYUFBUCxDQURtQjtDQUF2Qjs7Ozs7Ozs7OztBQVlBLFNBQVMsU0FBVCxDQUFvQixJQUFwQixFQUEwQixNQUExQixFQUFrQzs7Ozs7QUFLOUIsYUFBUyxJQUFULENBTDhCOztBQU85QixRQUFJLENBQUMsTUFBRCxFQUFTOztBQUVULGdCQUZTO0tBQWI7OztBQVA4QixVQWE5QixDQUFPLGdCQUFQLENBQXdCLFVBQXhCLEVBQW9DLFVBQVUsRUFBVixFQUFjO0FBQzlDLGdCQUQ4QztLQUFkLENBQXBDOzs7QUFi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LFNBQVMsT0FBVCxHQUFvQjs7QUFFaEIsV0FBTyxPQUFQLENBQWUsT0FBZixHQUZnQjtDQUFwQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUm91dGVyIGZyb20gJ3JvdXRlcic7XHJcblxyXG52YXIgaGVyZVNwYW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnSGVyZScpO1xyXG5cclxuUm91dGVyLmNvbmZpZ3VyZShbXHJcbiAgICB7cGF0dGVybjogXCIvXCIsIHBhZ2U6IFwicm9vdFwifSxcclxuICAgIHtwYXR0ZXJuOiBcIi9oZWxsb1wiLCBwYWdlOiBcImhlbGxvXCJ9LFxyXG4gICAge3BhdHRlcm46IFwiL3dvcmxkXCIsIHBhZ2U6IFwid29ybGRcIn1cclxuXSk7XHJcblxyXG5Sb3V0ZXIub25DaGFuZ2UgPSBmdW5jdGlvbiAocGFnZSwgYXJncykge1xyXG4gICAgY29uc29sZS5sb2cocGFnZSk7XHJcbiAgICBjb25zb2xlLmxvZyhhcmdzKTtcclxufSIsIi8qKlxyXG4gKiBTaW1wbGUgVVJMIHJvdXRlci5cclxuICpcclxuICogQG1vZHVsZSBmcmFtZXdvcmsvcm91dGVyXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgY29uZmlndXJlOiBjb25maWd1cmUsXHJcbiAgICBnZXRDdXJyZW50OiBnZXRDdXJyZW50LFxyXG4gICAgc2V0OiBzZXQsXHJcbiAgICBnbzogc2V0LCAgICAgICAgICAgICAgICAgIC8vIGFsaWFzIGZvciBzZXQoKVxyXG4gICAgYmFjazogYmFjayxcclxuICAgIGZvcndhcmQ6IGZvcndhcmQsXHJcbiAgICBvbkNoYW5nZTogbnVsbFxyXG59XHJcblxyXG52YXIgQ09ORklHID0gW107XHJcbnZhciBDVVJSRU5UX1NUQVRFID0gbnVsbDtcclxuXHJcbmZ1bmN0aW9uIGdldEN1cnJlbnQgKCkge1xyXG4gICAgcmV0dXJuIENVUlJFTlRfU1RBVEU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmUgVVJMIHJvdXRlcy4gVVJMIHJvdXRlIHBhdHRlcm5zIHVzZSBjdXJseSBicmFja2V0cyB0byBjYXB0dXJlIGFyZ3VtZW50cywgYnV0IGJlIGNhcmVmdWwgYXMgcXVlcnktc3RyaW5nXHJcbiAqIHRlcm1zIHdpbGwgb3ZlcndyaXRlIGFueSBjYXB0dXJlcyBpZiB0aGV5IHNoYXJlIHRoZSBzYW1lIG5hbWUgKGkuZS4gL2hvbWUvcGFnZS97dXNlcn0gcGF0dGVybiwgd2hlbiBtYXRjaGVkIHdpdGhcclxuICogL2hvbWUvcGFnZS8xIHdvdWxkIGNhcHR1cmUgdXNlcj0xLCBidXQgd2hlbiBtYXRjaGVkIHdpdGggL2hvbWUvcGFnZS8xP3VzZXI9MyB3aWxsIGNhcHR1cmUgdXNlcj0zKVxyXG4gKlxyXG4gKiBAcGFyYW0ge1ttYXRjaFNwZWNdfSB1cmxzIC0gVVJMIHJvdXRlIHBhdHRlcm5zXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9pbml0IC0gaWYgdHJ1ZSwgZG8gbm8gY2FsbCBvbkNoYW5nZSBpbW1lZGlhdGVseSB1c2luZyB0aGUgY3VycmVudCB3aW5kb3cubG9jYXRpb25cclxuICovXHJcbmZ1bmN0aW9uIGNvbmZpZ3VyZSAodXJscywgbm9pbml0KSB7XHJcbiAgICAvLyB1cmxzID0+IFt7cGF0dGVybjosIHBhZ2U6fV1cclxuICAgIC8vIHdoZXJlIHBhdHRlcm4gaXMgYSBwYXRoIHRvIG1hdGNoIHdpdGggdXNpbmcgc2ltcGxpZmllZCBjdXJseSBzeW50YXggZS5nLiAvaG9tZS9wYWdlL3t1c2VySWR9XHJcbiAgICAvLyBpZiBub2luaXQgPSB0cnVlLCB0aGVuIGRvIG5vdCBjYWxsIG9uQ2hhbmdlIGltbWVkaWF0ZWx5IHVzaW5nIHRoZSBjdXJyZW50IHdpbmRvdy5sb2NhdGlvblxyXG5cclxuICAgIENPTkZJRyA9IHVybHM7XHJcblxyXG4gICAgaWYgKCFub2luaXQpIHtcclxuICAgICAgICAvLyBSZXZlcnNlIHRoZSBjdXJyZW50IHdpbmRvdyBsb2NhdGlvblxyXG4gICAgICAgIGFwcGx5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSG9vayBpbnRvIG9ucG9wc3RhdGVcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgZnVuY3Rpb24gKGV2KSB7XHJcbiAgICAgICAgYXBwbHkoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhvb2sgaW50byBhIGxpbmsgY2xpY2tzXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldikge1xyXG4gICAgICAgIGlmIChldi50YXJnZXQudGFnTmFtZSAhPT0gJ0EnKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2LnRhcmdldC5ocmVmKTtcclxuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sIGZhbHNlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBjdXJyZW50IHdpbmRvdyBsb2NhdGlvbi9wYXRoIGFuZCB1cGRhdGUgdGhlIFJvdXRlciBzdGF0ZS5cclxuICovXHJcbmZ1bmN0aW9uIGFwcGx5ICgpIHtcclxuICAgIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUsXHJcbiAgICAgICAgdXJsUGFydHMgPSB1cmwuc3BsaXQoJy8nKS5zbGljZSgxKTsgICAgIC8vIHNsaWNlKDEpIHRvIGdldCByaWQgb2YgaW5pdGlhbCBzbGFzaCAvXHJcblxyXG4gICAgZm9yICh2YXIgaSBpbiBDT05GSUcpIHtcclxuICAgICAgICB2YXIgbWF0Y2hQYXJ0cyA9IENPTkZJR1tpXS5wYXR0ZXJuLnNwbGl0KCcvJykuc2xpY2UoMSk7XHJcblxyXG4gICAgICAgIGlmICh1cmxQYXJ0cy5sZW5ndGggPT09IG1hdGNoUGFydHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrIHBhcnQgYnkgcGFydCwgd2hlcmUgY3VybHkgYXJncyBtYXRjaCBhbnl0aGluZ1xyXG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXJncyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB1cmxQYXJ0cy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKC9eXFx7LipcXH0kLy50ZXN0KG1hdGNoUGFydHNbal0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRnJlZSBhcmd1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbbWF0Y2hQYXJ0c1tqXS5zbGljZSgxLCAtMSldID0gdXJsUGFydHNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1hdGNoUGFydHNbal0gPT09IHVybFBhcnRzW2pdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRm91bmQgbWF0Y2gsIGFkZCBhbnkgc2VhcmNoIGFyZ3MgZnJvbSB3aW5kb3cubG9jYXRpb24uc2VhcmNoXHJcbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoVGVybXMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLmxlbmd0aCA+IDAgPyB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnNsaWNlKDEpLnNwbGl0KCcmJykgOiBbXTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaFRlcm1zLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdHAgPSB0LnNwbGl0KCc9Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnc1t0cFswXV0gPSBkZWNvZGVVUkkodHBbMV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGN1cnJlbnQgc3RhdGUgYW5kIHRyaWdnZXIgb25DaGFuZ2VcclxuICAgICAgICAgICAgICAgIENVUlJFTlRfU1RBVEUgPSB7XCJyb3V0ZVwiOiBDT05GSUdbaV0ucGFnZSwgXCJhcmdzXCI6IGFyZ3N9O1xyXG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZS5leHBvcnRzLm9uQ2hhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlLmV4cG9ydHMub25DaGFuZ2UoQ09ORklHW2ldLnBhZ2UsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogTmF2aWdhdGUgdG8gdGhlIHNwZWNpZmllZCBwYWdlIHdpdGggdGhlIHN1cHBsaWVkIGFyZ3VtZW50cy4gV2lsbCBhZGQgYSBoaXN0b3J5IGVudHJ5IGFuZCBjYWxsIG9uQ2hhbmdlIGlmIGNvbmZpZ3VyZWQuXHJcbiAqIFBhZ2UgbmFtZXMgYXJlIGRlZmluZWQgaW4gdGhlIGNvbmZpZ3VyZSgpIGNhbGwuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlIC0gUGFnZSBuYW1lIGFzIGRlZmluZWQgaW4gY29uZmlndXJhdGlvbi5cclxuICogQHBhcmFtIHtPYmplY3R9IFthcmdzXSAtIEFyZ3VtZW50cy9wYXJhbWV0ZXIgZm9yIHRoZSBwYWdlLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW3RpdGxlXSAtIFNldCB3aW5kb3cgdGl0bGUgb24gcGFnZSB0cmFuc2l0aW9uLlxyXG4gKi9cclxuZnVuY3Rpb24gc2V0IChwYWdlLCBhcmdzLCB0aXRsZSkge1xyXG4gICAgZm9yICh2YXIgaSBpbiBDT05GSUcpIHtcclxuICAgICAgICBpZiAoQ09ORklHW2ldLnBhZ2UgPT09IHBhZ2UpIHtcclxuICAgICAgICAgICAgdmFyIHVybCA9IENPTkZJR1tpXS5wYXR0ZXJuLnNsaWNlKCksXHJcbiAgICAgICAgICAgICAgICB1bmNhcHR1cmVkID0gW107ICAgICAgICAvLyB1bmNhcHR1cmVkIGFyZ3VtZW50c1xyXG5cclxuICAgICAgICAgICAgLy8gUmVwbGFjZSBjdXJseSBhcmdzXHJcbiAgICAgICAgICAgIGZvciAodmFyIGFyZyBpbiBhcmdzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJnUmUgPSBuZXcgUmVnRXhwKFwiXFxcXHtcIiArIGFyZyArIFwiXFxcXH1cIiwgJ2cnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodXJsLnNlYXJjaChhcmdSZSkgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKGFyZ1JlLCBhcmdzW2FyZ10pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB1bmNhcHR1cmVkLnB1c2goYXJnICsgXCI9XCIgKyBlbmNvZGVVUkkoYXJnc1thcmddKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnc1thcmddID0gU3RyaW5nKGFyZ3NbYXJnXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBtaXNzaW5nIGFyZ3NcclxuICAgICAgICAgICAgaWYgKHVybC5zZWFyY2goL1xcey4qXFx9LykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gU29mdC1mYWlsXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiSW5jb21wbGV0ZSBhcmd1bWVudHMgaW4gbmF2aWdhdGlvbiByZXF1ZXN0LlwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGFueSB1bmNhcHR1cmVkIGFyZ3VtZW50cyBpbnRvIHRoZSBzZWFyY2ggZmllbGRcclxuICAgICAgICAgICAgaWYgKHVuY2FwdHVyZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdXJsICs9IFwiP1wiICsgdW5jYXB0dXJlZC5qb2luKCcmJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBoaXN0b3J5XHJcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgdXJsKTtcclxuICAgICAgICAgICAgaWYgKHRpdGxlKSB7IGRvY3VtZW50LnRpdGxlID0gdGl0bGU7IH1cclxuXHJcbiAgICAgICAgICAgIENVUlJFTlRfU1RBVEUgPSB7XCJyb3V0ZVwiOiBwYWdlLCBcImFyZ3NcIjogYXJnc307XHJcbiAgICAgICAgICAgIGlmIChtb2R1bGUuZXhwb3J0cy5vbkNoYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgbW9kdWxlLmV4cG9ydHMub25DaGFuZ2UocGFnZSwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB3aW5kb3cuaGlzdG9yeS5iYWNrKClcclxuICovXHJcbmZ1bmN0aW9uIGJhY2sgKCkge1xyXG4gICAgLy8gR28gYmFjayAoSGlzdG9yeTpwb3BTdGF0ZSlcclxuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB3aW5kb3cuaGlzdG9yeS5mb3J3YXJkKClcclxuICovXHJcbmZ1bmN0aW9uIGZvcndhcmQgKCkge1xyXG4gICAgLy8gR28gZm9yd2FyZCBpZiBwb3NzaWJsZVxyXG4gICAgd2luZG93Lmhpc3RvcnkuZm9yd2FyZCgpO1xyXG59Il19
