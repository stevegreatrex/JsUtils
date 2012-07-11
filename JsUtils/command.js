var Utils = Utils || {};

(function(Utils, ko) {
	﻿ko.command = Utils.command = function (options) {
		//allow just a function to be passed in
		if (typeof options === 'function') options = { action: options };

		//check an action was specified
		if (!options) throw "No options were specified";
		if (!options.action) throw "No action was specified in the options";

		var 

		//flag to indicate that the operation is running
		_isRunning = ko.observable(false),

		//record callbacks
		_callbacks = {
			done: [],
			fail: [],
			always: [function () { _isRunning(false); }]
		},

		//execute function (and return object
		_execute = function () {
			//notify that we are running and clear any existing error message
			_isRunning(true);

			//invoke the action and get a reference to the deferred object
			var promise = options.action.apply(_execute, arguments);

			//check that the returned object *is* a deferred object
			if (!promise || !promise.done || !promise.always || !promise.fail)
				throw "Specified action did not return a promise";

			//set up our callbacks
			promise
				.always(_callbacks.always)
				.fail(_callbacks.fail)
				.done(_callbacks.done);

				return promise;
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
		if (options.done) _callbacks.done.push(options.done);
		if (options.fail) _callbacks.fail.push(options.fail);

		//public properties
		_execute.isRunning    = _isRunning;
		_execute.done         = _done;
		_execute.fail         = _fail;
		_execute.always       = _always;

		return _execute;
	};
})(Utils, ko);