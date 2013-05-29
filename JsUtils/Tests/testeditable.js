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

    test("makeEditable throws when passed a null target", function () {
        raises(function() {
            ko.editable.makeEditable(null);
        }, /Target must be specified/);
    });

    test("makeEditable adds the editing methods to the target", function () {
        var target = {};

        ko.editable.makeEditable(target);

        ok(target.isEditing, "isEditing should have been added");
        ok(!target.isEditing(), "isEditing should be false");
        ok(target.beginEdit, "beginEdit should have been added");
        ok(target.endEdit, "endEdit should have been added");
        ok(target.cancelEdit, "cancelEdit should have been added");
    });

    test("makeEditable methods affect isEditing correctly", function () {
        var target = {};

        ko.editable.makeEditable(target);

        ok(!target.isEditing());

        target.endEdit();
        target.cancelEdit();
        ok(!target.isEditing());

        target.beginEdit();
        target.beginEdit();
        ok(target.isEditing());

        target.endEdit();
        ok(!target.isEditing());

        target.beginEdit();
        target.cancelEdit();
        ok(!target.isEditing());
    });

    test("makeEditable methods affect child properties", function () {
        var target = {
            level1: ko.editable(),
            childList: [
                ko.editable(),
                ko.editable()
            ],
            observableChildList: ko.observableArray([
                ko.editable(),
                ko.editable()
            ])
        },

        //helper methods
        eachTargetEditable = function (action, message) {
            action(target.level1, "(level1) " + message);
            action(target.childList[0], "(childList) " + message);
            action(target.childList[1], "(childList) " + message);
            action(target.observableChildList()[0], "(observableChildList) " + message);
            action(target.observableChildList()[1], "(observableChildList) " + message);
        },

        isEditing = function (editable, message) {
            ok(editable.isEditing(), message);
        },

        isNotEditing = function (editable, message) {
            ok(!editable.isEditing(), message);
        },

        setValue = function (editable) {
            editable("new value");
        },

        isNewValue = function (editable, message) {
            equal(editable(), "new value", message);
        },

        isNullValue = function (editable, message) {
            equal(editable(), null, message);
        };

        //tests
        ko.editable.makeEditable(target);
        eachTargetEditable(isNotEditing, "Should initially not be editing");
        eachTargetEditable(isNullValue, "All values should initially be null");

        target.beginEdit();
        eachTargetEditable(isEditing, "Should now be editing");
        eachTargetEditable(setValue);
        eachTargetEditable(isNewValue, "The new value should have been applied to all editables");

        target.cancelEdit();
        eachTargetEditable(isNotEditing, "Edit should have been cancelled");
        eachTargetEditable(isNullValue, "All values should have been reset");

        target.beginEdit();
        eachTargetEditable(isEditing, "Should now be editing");
        eachTargetEditable(setValue);
        target.endEdit();
        eachTargetEditable(isNotEditing, "Edit should have been confirmed");
        eachTargetEditable(isNewValue, "The new value should have been confirmed");
    });
}());