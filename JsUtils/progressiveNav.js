(function ($, ko, undefined) {
	"use strict";

	$.fn.progressiveNav = function (startGroup) {

		var $this = $(this),

			//shows a group with specified groupname
			showGroup = function (groupName) {
				$this.find("[data-nav-group!=" + groupName + "]").hide();
				$this.find("[data-nav-group=" + groupName + "]").fadeIn();

				//raise an event on the element to notify that it was updated
				$this.trigger("navchanged", groupName);
			};

		//hook up click event handlers for navigation
		$this
			.off("click.nav")
			.on("click.nav", "[data-nav-target]", function () {
				showGroup($(this).attr("data-nav-target"));
			});

		//grab the first group if none was specified
		if (!startGroup) {
			startGroup = $this.find("[data-nav-group]").first().attr("data-nav-group");
		}

		//show the first group - either passed in or the first one found
		showGroup(startGroup);
	};

	ko.bindingHandlers.progressiveNav = {
		init: function (element, valueAccessor) {
			var setter = valueAccessor();
			if (typeof setter === "function") {
				$(element).on("navchanged", function (e, groupName) {
					setter(groupName);
				});
			}
		},
		update: function (element, valueAccessor) {
			$(element).progressiveNav(ko.utils.unwrapObservable(valueAccessor()));
		}
	};
}(jQuery, ko));