var Command = function (options) {
	//check an action was specified
	if (!options) throw "No options were specified";
	if (!options.action) throw "No action was specified in the options";

	var _self = this,

	//flag to indicate that the operation is running
	_isRunning = ko.observable(false),

	//property to save the error message
	_errorMessage = ko.observable(),

	//execute function
	_execute = function () {
		//notify that we are running and clear any existing error message
		_isRunning(true);
		_errorMessage("");

		//invoke the action and get a reference to the deferred object
		var promise = options.action.apply(this, arguments);

		//check that the returned object *is* a deferred object
		if (!promise || !promise.done || !promise.always || !promise.fail)
			throw "Specified action did not return a promise";

		//set up our callbacks
		promise
		//always notify that the operation is complete
			.always(function () { _isRunning(false); })
		//save the error message if there is one
			.fail(function (_, message) { _errorMessage(message); });

		//attach any success or failure handlers
		if (options.done) promise.done(options.done);
		if (options.fail) promise.fail(options.fail);
	};

	//public properties
	this.isRunning = _isRunning;
	this.errorMessage = _errorMessage;
	this.execute = _execute;
};