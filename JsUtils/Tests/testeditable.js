(function () {
    "use strict";

    module("Editable Tests");

    test("editable creates observable object", function () {
        var editable = ko.editable();

        ok(editable, "The result should not be null");
        equal(null, editable(), "The result should be an executable function");
        ok(editable.subscribe, "The result should be observable");
    });

    test("editable sets initial value", function () {
        var editable = ko.editable("initial");

        equal("initial", editable(), "The initial value should be the constructor-specified initialiser");
    });

    test("editable sets editing flag", function () {
        var editable = ko.editable();

        equal(false, editable.isEditing(), "isEditing should be set to false");
    });

    test("beginEdit method sets editing flag to true", function () {
        var editable = ko.editable();

        editable.beginEdit();
        equal(true, editable.isEditing(), "isEditing should have been set to true");

        editable.beginEdit();
        equal(true, editable.isEditing(), "isEditing should not have been changed");
    });

    test("endEdit does nothing when beginEdit hasn't been called", function () {
        var editable = ko.editable();
        editable.endEdit();
        equal(false, editable.isEditing(), "isEditing should not have been changed");
    });

    test("cancelEdit does nothing when beginEdit hasn't been called", function () {
        var editable = ko.editable();
        editable.cancelEdit();
        equal(false, editable.isEditing(), "isEditing should not have been changed");
    });

    test("cancelEdit reverts changes", function () {
        var editable = ko.editable();

        editable.beginEdit();
        editable("new value");
        editable.cancelEdit();

        equal(null, editable(), "The old value should have been restored");

        editable("another value");
        editable.beginEdit();
        editable("another new value");
        editable.cancelEdit();

        equal("another value", editable(), "The old value should have been restored");
    });

    test("cancelEdit has not effect after endEdit", function () {
        var editable = ko.editable();

        editable.beginEdit();
        editable("new value");
        editable.endEdit();
        editable.cancelEdit();
        equal("new value", editable(), "The value of editable should not have been reverted");
    });
}());