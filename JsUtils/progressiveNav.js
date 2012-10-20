(function ($, undefined) {
	"use strict";

	$.fn.progressiveNav = function (startGroup) {
		//groups object to store discovered groups
		var groups = {},

			//cached reference to target
            $this = $(this),

			//find all nav links under target
            $allNav = $this.find("[data-nav-group]"),

			//helper function to display a named group
			showGroup = function (groupName) {
				$allNav.hide();

				if (groups[groupName]) {
					groups[groupName].fadeIn();
				}
			};

		//iterate through all nav items
		$allNav.each(function (i, element) {

			//get the group name
			var $element = $(element),
                groupName = $element.attr("data-nav-group");

			//record the group if we haven't seen it before
			if (!groups[groupName]) {
				groups[groupName] = null;
			}

			//if we don't have a start group, use the first one found
			if (!startGroup) {
				startGroup = groupName;
			}
		})
		//attach a click handler to handle navigation
		.click(function () {
			var target = $(this).attr("data-nav-target");
			if (target) {
				showGroup(target);
				return false;
			}
		});

		//iterate through all discovered groups and cache group items together
		for (var groupName in groups) {
			if (groups.hasOwnProperty(groupName)) {
				groups[groupName] = $this.find("[data-nav-group=" + groupName + "]");
			}
		}

		//show the first group - either passed in or the first one found
		showGroup(startGroup);
	};
}(jQuery));