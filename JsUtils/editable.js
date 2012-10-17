/*global ko: false*/

(function (window, ko, undefined) {
    "use strict";

    window.Utils = window.Utils || {};

    ko.editable = window.Utils.editable = function (initial) {
        var _rollbackValue,
            _observable = ko.observable(initial);

        //a flag to indicate if the field is being edited
        _observable.isEditing = ko.observable(false);

        //start an edit
        _observable.beginEdit = function () {
            _rollbackValue = _observable();
            _observable.isEditing(true);
        };

        //end (commit) an edit
        _observable.endEdit = function () {
            if (!_observable.isEditing()) { return; }

            _observable.isEditing(false);
        };

        //cancel and roll-back an edit
        _observable.cancelEdit = function () {
            if (!_observable.isEditing()) { return; }
            
            _observable(_rollbackValue);

            _observable.isEditing(false);
        };

        //public members
        return _observable;
    };
}(window, ko));