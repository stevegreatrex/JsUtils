﻿///#source 1 1 pagedobservablearray.js
/*global ko: false*/

(function (window, ko, undefined) {
    "use strict";

    window.Utils = window.Utils || {};

    window.Utils.PagedObservableArray = function (options) {
        options = options || {};

        if ($.isArray(options)) {
            options = { data: options };
        }

        var
		//the complete data collection
	        _allData = ko.observableArray(options.data || []),

		//the size of the pages to display
	        _pageSize = ko.observable(options.pageSize || 10),

		//the index of the current page
	        _pageIndex = ko.observable(0),

		//the current page data
	        _page = ko.computed(function () {
	            var pageSize = _pageSize(),
	                pageIndex = _pageIndex(),
	                startIndex = pageSize * pageIndex,
	                endIndex = pageSize * (pageIndex + 1);

	            return _allData().slice(startIndex, endIndex);
	        }, this),

		//the number of pages
	        _pageCount = ko.computed(function () {
	            return Math.ceil(_allData().length / _pageSize()) || 1;
	        }),

		//move to the next page
	        _nextPage = function () {
	            if (_pageIndex() < (_pageCount() - 1)) {
	                _pageIndex(_pageIndex() + 1);
	            }
	        },

		//move to the previous page
	        _previousPage = function () {
	            if (_pageIndex() > 0) {
	                _pageIndex(_pageIndex() - 1);
	            }
	        };

        //reset page index when page size changes
        _pageSize.subscribe(function () { _pageIndex(0); });
        _allData.subscribe(function () { _pageIndex(0); });

        //public members
        this.allData = _allData;
        this.pageSize = _pageSize;
        this.pageIndex = _pageIndex;
        this.page = _page;
        this.pageCount = _pageCount;
        this.nextPage = _nextPage;
        this.previousPage = _previousPage;
    };
}(window, ko));
///#source 1 1 pagedlist.js
/*global ko: false*/

(function (window, ko, undefined) {
    "use strict";

    window.Utils = window.Utils || {};

    ko.pagedList = window.Utils.pagedList = function(options) {
        if (!options) { throw "Options not specified"; }
        if (!options.loadPage) { throw "loadPage not specified on options"; }

		var //page size
			_pageSize = ko.observable(options.pageSize || 10),

			//current page index
			_pageIndex = ko.observable(0),

			//the total number of rows, defaulting to -1 indicating unknown
			_totalRows = ko.observable(-1),

			//observable containing current page data.  Using observable instead of observableArray as
			//all this will do is present data
			_page = ko.observable([]),

			//load a page of data, then display it
			_loadPage = window.Utils.command(function(pageIndex) {
				var promise = options.loadPage(pageIndex, _pageSize());
				if (!promise.pipe) { throw "loadPage should return a promise"; }

				return promise.pipe(_displayPage).done(function() {
					_pageIndex(pageIndex);
				});
			}),

			//display a page of data
			_displayPage = function(result) {
			    if (!result) { throw "No page results"; }
			    if (!result.rows) { throw "Result should contain rows array"; }

				if (options.map) {
					_page($.map(result.rows, options.map));
				} else {
					_page(result.rows);
				}

				//save the total row count if it was returned
				if (result.totalRows) {
					_totalRows(result.totalRows);
				}

				return result;
			},

			//the number of pages
			_pageCount = ko.computed(function() {
			    if (_totalRows() === -1) { return -1; }

				return Math.ceil(_totalRows() / _pageSize()) || 1;
			}),

			//command to move to the next page
			_nextPage = function() {
				var currentIndex = _pageIndex(),
					pageCount = _pageCount();
				if (pageCount === -1 || currentIndex < (pageCount - 1)) {
					_loadPage(currentIndex + 1);
				}
			},

			//command to move to the previous page
			_previousPage = function() {
				var targetIndex = _pageIndex() - 1;
				if (targetIndex >= 0) {
					_loadPage(targetIndex);
				}
			};

		//reset page index when page size changes
		_pageSize.subscribe(function() {
			_loadPage(0);
		});

		//populate with default data if specified
		if (options.firstPage) {
			_displayPage(options.firstPage);
		} else {
			_loadPage(0);
		}

		//public members
		_page.pageSize     = _pageSize;
		_page.pageIndex    = _pageIndex;
		_page.pageCount    = _pageCount;
		_page.totalRows    = _totalRows;
		_page.nextPage     = _nextPage;
		_page.previousPage = _previousPage;
		_page.loadPage     = _loadPage;

		return _page;
	};
}(window, ko));
///#source 1 1 editable.js
/*global ko: false*/

(function (window, ko, undefined) {
    "use strict";

    function toEditable(observable, getRollbackValue) {
        var rollbackValues = [];

        getRollbackValue = getRollbackValue || function (observable) { return observable(); };

        //a flag to indicate if the field is being edited
        observable.isEditing = ko.observable(false);

        //start an edit
        observable.beginEdit = function () {
            if (observable.isEditing()) { return; }

            rollbackValues.push(getRollbackValue(observable));

            observable.isEditing(true);
        };

        //end (commit) an edit
        observable.endEdit = function () {
            if (!observable.isEditing()) { return; }

            observable.isEditing(false);
        };

        //cancel and roll-back an edit
        observable.cancelEdit = function () {
            if (!observable.isEditing() || !rollbackValues.length) { return; }

            observable(rollbackValues.pop());

            observable.isEditing(false);
        };

        //roll-back to historical committed values
        observable.rollback = function () {
            if (rollbackValues.length) {
                observable(rollbackValues.pop());
            }
        };

        return observable;
    }

    ko.editable = function (initial) {
        return toEditable(ko.observable(initial));
    };

    ko.editableArray = function (initial) {
        return toEditable(ko.observableArray(initial || []), function (observable) {
            return observable.slice();
        });
    };

    var forEachEditableProperty = function (target, action) {
        for (var prop in target) {
            if (target.hasOwnProperty(prop)) {
                var value = target[prop];

                //direct editables
                if (value && value.isEditing) {
                    action(value);
                }

                var unwrappedValue = ko.utils.unwrapObservable(value);

                //editables in arrays
                if (unwrappedValue && unwrappedValue.length) {
                    for (var i = 0; i < unwrappedValue.length; i++) {
                        if (unwrappedValue[i] && unwrappedValue[i].isEditing) {
                            action(unwrappedValue[i]);
                        }
                    }
                }
            }
        }
    };

    ko.editable.makeEditable = function (target) {
        if (!target) {
            throw "Target must be specified";
        }

        target.isEditing = ko.observable(false);

        target.beginEdit = function () {
            if (!target.isEditable || target.isEditable()) {
                forEachEditableProperty(target, function (prop) { prop.beginEdit(); });
                target.isEditing(true);
            }
        };

        target.endEdit = function () {
            forEachEditableProperty(target, function (prop) { prop.endEdit(); });
            target.isEditing(false);
        };

        target.cancelEdit = function () {
            forEachEditableProperty(target, function (prop) { prop.cancelEdit(); });
            target.isEditing(false);
        };

        target.rollback = function () {
            forEachEditableProperty(target, function (prop) { prop.rollback(); });
        };
    };
}(window, ko));
///#source 1 1 command.js
/*global ko: false*/

(function (window, ko, undefined) {
    "use strict";

    window.Utils = window.Utils || {};

	ko.command = window.Utils.command = function (options) {
		//allow just a function to be passed in
	    if (typeof options === "function") { options = { action: options }; }

		//check an action was specified
	    if (!options) { throw "No options were specified"; }
	    if (!options.action) { throw "No action was specified in the options"; }

	    var

		//flag to indicate that the operation is running
		_isRunning = ko.observable(false),

		//flag to indicate that the operation failed when last executed
		_failed = ko.observable(false),

		//record callbacks
		_callbacks = {
			done: [],
			fail: [function () { _failed(true); }],
			always: [function () { _isRunning(false); }]
		},

		//factory method to create a $.Deferred that is already completed
		_instantDeferred = function(resolve, returnValue, context) {
			var deferred = $.Deferred();
			if (resolve) {
			    deferred.resolveWith(context, [returnValue]);
			} else {
			    deferred.rejectWith(context, [returnValue]);
			}

			return deferred;
		},

		//execute function (and return object
		_execute = function () {
			//check if we are able to execute
		    if (!_canExecuteWrapper.call(options.context || this)) {
				//dont attach any global handlers
		        return _instantDeferred(false, null, options.context || this).promise();
			}

			//notify that we are running and clear any existing error message
			_isRunning(true);
			_failed(false);

			//try to invoke the action and get a reference to the deferred object
			var promise;
			try {
			    promise = options.action.apply(options.context || this, arguments);

				//if the returned result is *not* a promise, create a new one that is already resolved
				if (!promise || !promise.done || !promise.always || !promise.fail) {
				    promise = _instantDeferred(true, promise, options.context || this).promise();
				}

			} catch(error) {
			    promise = _instantDeferred(false, error, options.context || this).promise();
			}

			//set up our callbacks
			promise
				.always(_callbacks.always)
				.fail(_callbacks.fail)
				.done(_callbacks.done);

			return promise;
		},
		
		//canExecute flag
		_forceRefreshCanExecute = ko.observable(), //note, this is to allow us to force a re-evaluation of the computed _canExecute observable
        _canExecuteWrapper = options.canExecute || function () { return true; },
		_canExecute = ko.computed(function() {
			_forceRefreshCanExecute(); //just get the value so that we register _canExecute with _forceRefreshCanExecute
			return !_isRunning() && _canExecuteWrapper.call(options.context || this);
		}, options.context || this),
		
		//invalidate canExecute
		_canExecuteHasMutated = function() {
			_forceRefreshCanExecute.notifySubscribers();
		},
	
		//function used to append done callbacks
		_done = function(callback) {
			_callbacks.done.push(callback);
			return _execute;
		},
		//function used to append failure callbacks
		_fail = function(callback) {
			_callbacks.fail.push(callback);
			return _execute;
		},
		//function used to append always callbacks
		_always = function(callback) {
			_callbacks.always.push(callback);
			return _execute;
		};

		//attach the done and fail handlers on the options if specified
	    if (options.done) { _callbacks.done.push(options.done); }
	    if (options.fail) { _callbacks.fail.push(options.fail); }

		//public properties
		_execute.isRunning            = _isRunning;
		_execute.canExecute           = _canExecute;
		_execute.canExecuteHasMutated = _canExecuteHasMutated;
		_execute.done                 = _done;
		_execute.fail                 = _fail;
		_execute.always               = _always;
		_execute.failed               = _failed;

		return _execute;
	};
}(window, ko));
///#source 1 1 pubsub.js
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
            subscription.callback.call(null, getEvent(event).lastPayload);
        }
    };

    $.publish = window.Utils.publish = function (event, data) {
        if (typeof event !== "string") {
            throw "Event name must be a string";
        }
        
        getEvent(event).lastPayload = data;
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
///#source 1 1 progressivenav.js
(function ($, ko, undefined) {
	"use strict";

	$.fn.progressiveNav = function (startGroup) {

		var $this = $(this),

			//shows a group with specified groupname
			showGroup = function (groupName) {
				$this.find("[data-nav-group!=" + groupName + "]").hide();
				$this.find("[data-nav-group=" + groupName + "]").fadeIn();

				//raise an event on the element to notify that it was updated
				$this.trigger("navchanged", groupName);
			};

		//hook up click event handlers for navigation
		$this
			.off("click.nav")
			.on("click.nav", "[data-nav-target]", function () {
				showGroup($(this).attr("data-nav-target"));
			});

		//grab the first group if none was specified
		if (!startGroup) {
			startGroup = $this.find("[data-nav-group]").first().attr("data-nav-group");
		}

		//show the first group - either passed in or the first one found
		showGroup(startGroup);
	};

	ko.bindingHandlers.progressiveNav = {
		init: function (element, valueAccessor) {
			var setter = valueAccessor();
			if (typeof setter === "function") {
				$(element).on("navchanged", function (e, groupName) {
					setter(groupName);
				});
			}

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				$(element).off("navchanged");
			});
		},
		update: function (element, valueAccessor) {
			$(element).progressiveNav(ko.utils.unwrapObservable(valueAccessor()));
		}
	};
}(jQuery, ko));
