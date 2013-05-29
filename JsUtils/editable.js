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

    var forEachEditableProperty = function (target, action) {
	    for (var prop in target) {
	        if (target.hasOwnProperty(prop)) {
                //unwrap the value to support observable arrays and properties
				var value = ko.utils.unwrapObservable(target[prop]);

				//direct editables
				if (value && value.isEditing) {
					action(value);
				}

				//editables in arrays
				if (value && value.length) {
				    for (var i = 0; i < value.length; i++) {
						if (value[i] && value[i].isEditing) {
							action(value[i]);
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
	};
}(window, ko));