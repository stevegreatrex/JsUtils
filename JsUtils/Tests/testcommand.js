module("Command Tests");

test("throws when null options are specified", function () {
	raises(function () {
		new Command();
	}, /No options were specified/);
});

test("throws when no action is specified", function () {
	raises(function () {
		new Command({});
	}, /No action was specified in the options/);
});

test("isRunning initially false", function () {
	var command = new Command({ action: {} });
	equal(false, command.isRunning());
});

test("errorMessage initially null", function () {
	var command = new Command({ action: {} });
	equal(null, command.errorMessage());
});

test("execute throws if action doesn't return promise", function () {
	var command = new Command({
		action: function () { }
	});

	raises(function () {
		command.execute();
	}, /Specified action did not return a promise/);
});

test("execute is passed correct this and arguments", function () {
	var arg1 = "one", arg2 = "two";
	var command = new Command({
		action: function (a1, a2) {
			equal(this, command, "this was not set to the command");
			equal(a1, arg1, "arguments were not passed in");
			equal(a2, arg2, "arguments were not passed in");
			return $.Deferred();
		}
	});

	command.execute(arg1, arg2);
});


test("execute sets isRunning and clears error", function () {
	var deferred = $.Deferred();
	var command = new Command({
		action: function () {
			return deferred;
		}
	});

	//set the initial value of error message
	command.errorMessage("not blank");

	//execute the command
	command.execute();

	//check that isRunning is true and the error was cleared
	equal(true, command.isRunning(), "isRunning should be set");
	equal("", command.errorMessage(), "errorMessage should be cleared");

	//complete the async operation
	deferred.resolve();

	//check is running has been reset
	equal(false, command.isRunning(), "isRunning should be reset");
});

test("execute saves error", function () {
	var deferred = $.Deferred();
	var command = new Command({
		action: function () {
			return deferred;
		}
	});

	//set the initial value of error message
	command.errorMessage("not blank");

	//execute the command
	command.execute();

	//check that isRunning is true and the error was cleared
	equal(true, command.isRunning(), "isRunning should be set");
	equal("", command.errorMessage(), "errorMessage should be cleared");

	//fail the async operation
	deferred.reject({}, "error message");

	//check is running has been reset
	equal(false, command.isRunning(), "isRunning should be reset");
	equal("error message", command.errorMessage(), "errorMessage should be populated");
});

test("execute invokes done handlers", function () {
	var deferred = $.Deferred(),
		responseData = {},
		handlerCalled = false;

	var command = new Command({
		action: function () {
			return deferred;
		},
		done: function (data) {
			equal(responseData, data, "The data should be passed to the done handler");
			handlerCalled = true;
		}
	});

	//execute the command
	command.execute();

	//complete the async operation
	deferred.resolve(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The done handler should have been called");
});

test("execute invokes fail handlers", function () {
	var deferred = $.Deferred(),
		responseData = {},
		handlerCalled = false;

	var command = new Command({
		action: function () {
			return deferred;
		},
		fail: function (data) {
			equal(responseData, data, "The data should be passed to the fail handler");
			handlerCalled = true;
		}
	});

	//execute the command
	command.execute();

	//complete the async operation
	deferred.reject(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The fail handler should have been called");
});