module("Publish & Subscribe");

test("subscribe and publish throw errors on invalid event name", function () {
    raises(function () { $.subscribe(); }, /Event name must be a string/);
    raises(function () { $.subscribe({}); }, /Event name must be a string/);
    raises(function () { $.subscribe(function () { }); }, /Event name must be a string/);

    raises(function () { $.publish(); }, /Event name must be a string/);
    raises(function () { $.publish({}); }, /Event name must be a string/);
    raises(function () { $.publish(function () { }); }, /Event name must be a string/);
});

test("subscribe throws when options are specified without a callback", function () {
    raises(function () { $.subscribe("evt", {}); }, /Callback was not specified on options/);
});

test("subscribe receives published events", function () {
    var sampleData = "some sample data",
    subscriber1Called = false,
    subscriber2Called = false,
    subscriber3Called = false;

    $.subscribe("event1", function (data) {
        equal(data, sampleData);
        subscriber1Called = true;
    });

    $.subscribe("event1", {
        callback: function (data) {
            equal(data, sampleData);
            subscriber2Called = true;
        }
    });

    $.subscribe("event2", function () {
        subscriber3Called - true;
    });

    $.publish("event1", sampleData);

    ok(subscriber1Called, "Subscriber with function should be called");
    ok(subscriber2Called, "Subscriber with options should be called");
    ok(!subscriber3Called, "Subscribers to other events should not be invoked");
});

test("subscribe async uses setTimeout", function () {
  var sampleData = "some sample data",
      setTimeoutUsed = false,
      subscriberCalled = false;

    $.subscribe("event1", {
        callback: function (data) {
            equal(data, sampleData);
            subscriberCalled = true;
        },
        async: true
    });

    setTimeout = function (inner, delay) {
        setTimeoutUsed = true;
        equal(4, delay, "Delay should be 4");
        inner();
    };

    $.publish("event1", sampleData);

    ok(subscriberCalled, "Subscriber should be called");
    ok(setTimeoutUsed, "Subscriber should be called with ");
});

test("subscribe is stateful", function () {
    var sampleData = "some sample data",
      subscriberCalled = false;

    $.publish("event1", sampleData);

    $.subscribe("event1", {
        callback: function (data) {
            equal(data, sampleData);
            subscriberCalled = true;
        },
        stateful: true
    });   

    ok(subscriberCalled, "Subscriber should be called");
});