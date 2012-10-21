module("Progressive Navigation");

var buildNavLink = function (group, target) {
	var link = $("<a>");
	if (group) {
		link.attr("data-nav-group", group);
	}
	if (target) {
		link.attr("data-nav-target", target);
	}
	return link;
};
var buildNavUI = function () {

	var context = {
		container: $("<div id='target'>"),
		top: buildNavLink("top", "branch1").after(buildNavLink("top", "branch2")),
		branch1: buildNavLink("branch1", "leaf1").after(buildNavLink("branch1", "leaf2")).after(buildNavLink("branch1", "leaf3")),
		branch2: buildNavLink("branch2", "leaf4").after(buildNavLink("branch2", "leaf5")).after(buildNavLink("branch2"))
	};
	
	context.top.appendTo(context.container);
	context.branch1.appendTo(context.container);
	context.branch2.appendTo(context.container);

	//replace fadeIn with show to allow us to test visibility
	$.fn.fadeIn = $.fn.show;

	return context;
};

$.fn.allHidden = function () {
	var hidden = true;

	$(this).each(function () {
		if ($(this).css("display") !== "none") {
			hidden = false;
		}
	});

	return hidden;
};

test("removes all nav items except first group when no group specified", function () {
	var context = buildNavUI();

	context.container.progressiveNav();

	ok(!context.top.allHidden(), "first group should not be hidden");
	ok(context.branch1.allHidden(), "other groups should be hidden");
	ok(context.branch2.allHidden(), "other groups should be hidden");
});

test("removes all nav items except specified group", function () {
	var context = buildNavUI();

	context.container.progressiveNav("branch1");

	ok(context.top.allHidden(), "other groups should be hidden");
	ok(!context.branch1.allHidden(), "specified group should be displayed");
	ok(context.branch2.allHidden(), "other groups should be hidden");
});

test("click selects target group", function () {
	var context = buildNavUI();

	context.container.progressiveNav();

	//'click' on branch 2
	$(context.top[1]).trigger("click");

	//check that branch 2 is now visible
	ok(context.top.allHidden(), "other groups should be hidden");
	ok(context.branch1.allHidden(), "other groups should be hidden");
	ok(!context.branch2.allHidden(), "selected group should be displayed");
});

test("click does nothing when there is no target", function () {
	var context = buildNavUI();

	context.container.progressiveNav();

	//'click' on branch 2
	$(context.branch2[2]).trigger("click");

	ok(!context.top.allHidden(), "no changes should have been made");
	ok(context.branch1.allHidden(), "no changes should have been made");
	ok(context.branch2.allHidden(), "no changes should have been made");
});

test("multiple calls select correct group", function () {
	var context = buildNavUI();

	context.container.progressiveNav("branch2");

	//check that branch 2 is now visible
	ok(context.top.allHidden(), "other groups should be hidden");
	ok(context.branch1.allHidden(), "other groups should be hidden");
	ok(!context.branch2.allHidden(), "selected group should be displayed");

	context.container.progressiveNav("branch1");

	//check that branch 1 is now visible
	ok(context.top.allHidden(), "other groups should be hidden");
	ok(context.branch2.allHidden(), "other groups should be hidden");
	ok(!context.branch1.allHidden(), "selected group should be displayed");
});

test("navigation raises event", function () {
	var context = buildNavUI(),
		events = [];
	context.container.on("navchanged", function (e, group) { events.push(group); });

	context.container.progressiveNav();
	context.container.progressiveNav("branch1");
	$(context.top[1]).trigger("click");
	context.container.progressiveNav("top");
	$(context.top[0]).trigger("click");

	//check that each of the above raised an event
	deepEqual([
		"top",
		"branch1",
		"branch2",
		"top",
		"branch1"
	], events, "events should have been raised");
});