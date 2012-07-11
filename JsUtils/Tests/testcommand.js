module("Command Tests");

test("throws when null options are specified", function () {
	raises(function () {
		Utils.command();
	}, /No options were specified/);
});

test("throws when no action is specified", function () {
	raises(function () {
		Utils.command({});
	}, /No action was specified in the options/);
});

test("isRunning initially false", function () {
	var command = Utils.command({ action: {} });
	equal(false, command.isRunning());
});

test("execute returns a completed deferred if the action does not return a promise", function () {
	var command = Utils.command({
		action: function () { }
	});

	//execute the command
	var result = command();

	//check that the returned item is a completed promise
	ok(result, "The result should be a completed promise");
	ok(result.done, "The result should be a completed promise");
	ok(result.fail, "The result should be a completed promise");
	ok(result.always, "The result should be a completed promise");
	ok(result.isResolved, "The result should be a completed promise");

	//check that we are no longer running
	equal(command.isRunning(), false, "The command should not be running");
});

test("execute resolves completed deferred with original result if result is returned from function", function() {
	var doneCalled = false,
		actionResult = { value: 123 },
		command = Utils.command({
			action: function () { return actionResult; }
		});

	//execute the command and check the result
	var result = command().done(function(result) {
		equal(result, actionResult, "The action's result should be passed to the done handler");
		doneCalled = true;
	});

	//check that the handler was actually called
	ok(doneCalled, "The done handler should have been invoked immediately");

	//check that we are no longer running
	equal(command.isRunning(), false, "The command should not be running");
});


test("execute runs fail handlers if the command action throws an error", function() {
	var failCalled = false,
		actionError = "a random error",
		command = Utils.command({
			action: function () { throw actionError; }
		});

	//execute the command and check the result
	var result = command().fail(function (error) {
		equal(error, actionError, "The action's error should be passed to the fail handler");
		failCalled = true;
	});

	//check that the handler was actually called
	ok(failCalled, "The fail handler should have been invoked immediately");

	//check that we are no longer running
	equal(command.isRunning(), false, "The command should not be running");
});

test("execute is passed correct this and arguments", function () {
	var arg1 = "one", arg2 = "two";
	var command = Utils.command({
		action: function (a1, a2) {
			equal(this, command, "this was not set to the command");
			equal(a1, arg1, "arguments were not passed in");
			equal(a2, arg2, "arguments were not passed in");
			return $.Deferred();
		}
	});

	command(arg1, arg2);
});


test("execute sets isRunning", function () {
	var deferred = $.Deferred();
	var command = Utils.command({
		action: function () {
			return deferred;
		}
	});

	//execute the command
	command();

	//check that isRunning is true and the error was cleared
	equal(true, command.isRunning(), "isRunning should be set");

	//complete the async operation
	deferred.resolve();

	//check is running has been reset
	equal(false, command.isRunning(), "isRunning should be reset");
});

test("execute invokes done handlers", function () {
	var deferred = $.Deferred(),
		responseData = {},
		handlerCalled = false;

	var command = Utils.command({
		action: function () {
			return deferred;
		},
		done: function (data) {
			equal(responseData, data, "The data should be passed to the done handler");
			handlerCalled = true;
		}
	});

	//execute the command
	command();

	//complete the async operation
	deferred.resolve(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The done handler should have been called");
});

test("execute invokes fail handlers", function () {
	var deferred = $.Deferred(),
		responseData = {},
		handlerCalled = false;

	var command = Utils.command({
		action: function () {
			return deferred;
		},
		fail: function (data) {
			equal(responseData, data, "The data should be passed to the fail handler");
			handlerCalled = true;
		}
	});

	//execute the command
	command();

	//complete the async operation
	deferred.reject(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The fail handler should have been called");
});

test("done attaches handler", function () {
	var deferred = $.Deferred(),
		responseData = {},
		handlerCalled = false;

	var command = Utils.command({
		action: function () {
			return deferred;
		}
	})
    .done(function (data) {
    	equal(responseData, data, "The data should be passed to the done handler");
    	handlerCalled = true;
    });

	//execute the command
	command();

	//complete the async operation
	deferred.resolve(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The done handler should have been called");
});

test("fail attaches handler", function () {
	var deferred = $.Deferred(),
		responseData = {},
		handlerCalled = false;

	var command = Utils.command({
		action: function () {
			return deferred;
		}
	})
    .fail(function (data) {
    	equal(responseData, data, "The data should be passed to the fail handler");
    	handlerCalled = true;
    });

	//execute the command
	command();

	//complete the async operation
	deferred.reject(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The fail handler should have been called");
});

test("always handler is invoked on done", function () {
	var deferred = $.Deferred(),
		responseData = {},
		handlerCalled = false;

	var command = Utils.command({
		action: function () {
			return deferred;
		}
	})
    .always(function (data) {
    	equal(responseData, data, "The data should be passed to the done handler");
    	handlerCalled = true;
    });

	//execute the command
	command();

	//complete the async operation
	deferred.resolve(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The done handler should have been called");
});

test("always handler is invoked on fail", function () {
	var deferred = $.Deferred(),
		responseData = {},
		handlerCalled = false;

	var command = Utils.command({
		action: function () {
			return deferred;
		}
	})
    .always(function (data) {
    	equal(responseData, data, "The data should be passed to the fail handler");
    	handlerCalled = true;
    });

	//execute the command
	command();

	//complete the async operation
	deferred.reject(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The fail handler should have been called");
});

test("can specify function as only parameter", function () {
	var deferred = $.Deferred();

	var command = Utils.command(function () {
		return deferred;
	});

	//execute the command
	command();

	//check that isRunning is true
	equal(true, command.isRunning(), "isRunning should be set");

	//complete the async operation
	deferred.resolve();

	//check is running has been reset
	equal(false, command.isRunning(), "isRunning should be reset");
});

test("execute returns promise", function () {
	var deferred = $.Deferred(),
	responseData = {},
	handlerCalled = false;

	var command = Utils.command({
		action: function () {
			return deferred;
		}
	});

	//execute the command and attach the done handler
	command().done(function (data) {
		equal(responseData, data, "The data should be passed to the done handler");
		handlerCalled = true;
	});

	//complete the async operation
	deferred.resolve(responseData);

	//check the handler was invoked
	equal(true, handlerCalled, "The done handler should have been called");
});

test("can use ko.command syntax", function() {
	var deferred1 = $.Deferred(),
		deferred2 = $.Deferred(),
		done1 = false,
		done2 = false,
		ViewModel = function() {
			this.command1 = ko.command(function() { return deferred1; }).done(function() { done1 = true });
			this.command2 = ko.command(function() { return deferred2; }).done(function() { done2 = true });
		},
		testSubject = new ViewModel();

	//run one of the commands and check it is the only one running
	testSubject.command1();
	equal(testSubject.command1.isRunning(), true, "First command should be running");
	equal(testSubject.command2.isRunning(), false, "Second command should not be running");

	//start the second command running
	testSubject.command2();
	equal(testSubject.command1.isRunning(), true, "Both commands should now be running");
	equal(testSubject.command2.isRunning(), true, "Both commands should now be running");

	//allow the second command to complete
	deferred2.resolve();

	//check that only the second command has completed
	equal(testSubject.command1.isRunning(), true, "First command should still be running");
	equal(testSubject.command2.isRunning(), false, "Second command should have completed");
	equal(done1, false, "First command should not have invoked handlers");
	equal(done2, true, "Second command should have invoked handlers");

	//now let the first command complete and check it's properties
	deferred1.resolve();
	equal(testSubject.command1.isRunning(), false, "First command should now have completed");
	equal(done1, true, "First command should have invoked handlers");
});