var Command = function (options) {
	//check an action was specified
	if (!options) throw "No options were specified";
	if (!options.action) throw "No action was specified in the options";

	var _self = this,

	//flag to indicate that the operation is running
	_isRunning = ko.observable(false),

	//property to save the error message
	_errorMessage = ko.observable(),

    //record callbacks
    _callbacks = {
        done: [],
        fail: [function (_, message) { _errorMessage(message); }],
        always: [function () { _isRunning(false); }]
    },

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
		    .always(_callbacks.always)
		    .fail(_callbacks.fail)
            .done(_callbacks.done);
	},
    
    //function used to append done callbacks
    _done = function(callback) {
        _callbacks.done.push(callback);
        return _self;
    },
    //function used to append failure callbacks
    _fail = function(callback) {
        _callbacks.fail.push(callback);
        return _self;
    },
    //function used to append always callbacks
    _always = function(callback) {
        _callbacks.always.push(callback);
        return _self;
    };

    //attach the done and fail handlers on the options if specified
    if (options.done) _callbacks.done.push(options.done);
    if (options.fail) _callbacks.fail.push(options.fail);

	//public properties
	this.isRunning    = _isRunning;
	this.errorMessage = _errorMessage;
	this.execute      = _execute;
    this.done         = _done;
    this.fail         = _fail;
    this.always       = _always;
};