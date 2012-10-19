(function (window, $, undefined) {
    "use strict";

    var events = {},
       defaults = {
           stateful: false,
           async: false
       },
        getEvent = function (event) {
            if (!events[event]) {
                events[event] = {
                    subscriptions: []
                };
            }
            return events[event];
        };

    window.Utils = window.Utils || {};

   $.subscribe = window.Utils.subscribe = function (event, callback) {
        if (typeof event !== "string") {
            throw "Event name must be a string";
        }

        var subscription;

        if (typeof callback === "function") {
            subscription = $.extend({ callback: callback }, defaults);
        } else {
            subscription = $.extend({}, defaults, callback);
            if (!subscription.callback) {
                throw "Callback was not specified on options";
            }
        }

        
        getEvent(event).subscriptions.push(subscription);

        if (subscription.stateful) {
            subscription.callback.call(null, getEvent(event).lastPublish);
        }
    };

    $.publish = window.Utils.publish = function (event, data) {
        if (typeof event !== "string") {
            throw "Event name must be a string";
        }
        
        getEvent(event).lastPublish = data;
        var subscriptions = events[event].subscriptions;
        for (var i = 0; i < subscriptions.length; i++) {
            (function (subscription, data) {
                if (subscription.async) {
                    setTimeout(function () {
                        subscription.callback.call(null, data);
                    }, 4);
                } else {
                    subscription.callback.call(null, data);
                }
            }(subscriptions[i], data));
        }
    };
}(window, jQuery));