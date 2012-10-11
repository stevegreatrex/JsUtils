module("pagedList tests");

var instantDeferred = function(result) {
	var defer = $.Deferred();
	defer.resolve(result);
	return instantDeferred;
};

test("constructor throws exception when no options specified", function() {
	raises(function() {
		Utils.pagedList();
	}, /Options not specified/);
});

test("constructor throws exception when no loadPage specified", function () {
	raises(function () {
		Utils.pagedList({});
	}, /loadPage not specified on options/);
});

test("pageSize defaults to 10", function () {
	var testSubject = new Utils.pagedList({ loadPage: function () { }, firstPage: { rows: []} });

	equal(testSubject.pageSize(), 10, "pageSize should default to 10");
});

test("pageSize is set to constructor options value", function () {
	var testSubject = new Utils.pagedList({ loadPage: function () { },  pageSize: 20 });

	equal(testSubject.pageSize(), 20, "pageSize should be set to the value from the constructor options");
});

test("pageIndex is initially zero", function () {
	var testSubject = new Utils.pagedList({ loadPage: function(){}, firstPage: { rows: [] }});

	equal(testSubject.pageIndex(), 0, "pageIndex should default to zero");
});

test("pageCount is -1 when totalRows is -1", function() {
	var testSubject = new Utils.pagedList({ loadPage: function () { }, firstPage: { rows: []} });

	equal(testSubject.pageCount(), -1, "pageCount should default to -1 when totalRows is -1");
});

test("contains firstpage data if specified", function() {
	var loadCalled = false,
		data = [1,2,3],
		testSubject = Utils.pagedList({
			loadPage: function() {
				loadCalled = true;
			},
			firstPage: {
				rows: data
			}
		});

	deepEqual(testSubject(), data, "The first page of data should have been automatically displayed");
	ok(!loadCalled, "The load method should not have been called");
});

test("totalRows updated by firstpage data if specified", function() {
	var loadCalled = false,
		data = [1, 2, 3],
		testSubject = Utils.pagedList({
			loadPage: function () {
				loadCalled = true;
			},
			firstPage: {
				rows: data,
				totalRows: 123
			}
		});

	equal(123, testSubject.totalRows(), "totalRows should have been updated");
	ok(!loadCalled, "The load method should not have been called");
});

test("pageCount updated by firstpage data", function() {
	var data = [1, 2, 3, 4, 5],
		testSubject = Utils.pagedList({
			loadPage: function () {},
			firstPage: {
				rows: data,
				totalRows: 123
			},
			pageSize: 10
		});

	equal(testSubject.pageCount(), 13, "pageCount should be recalculated after loading firstpage data");
});

test("page zero is loaded if no firstpage specified", function() {
	var loading = $.Deferred(),
		data = [1, 2, 3],
		testSubject = Utils.pagedList({
			loadPage: function (pageIndex, pageSize) {
				equal(pageIndex, 0, "Load should have been called with pageIndex of zero");
				equal(pageSize, 10, "pageSize should have been passed to the loadPage function");
				return loading;
			}
		});

	//check the current state
	ok(testSubject.loadPage.isRunning(), "The load should be running");
	deepEqual(testSubject(), [], "The page should be empty until load completes");
	
	//allow the load to complete
	loading.resolve({
		rows: data,
		totalRows: 99
	});

	//check that we are no longer running the load
	ok(!testSubject.loadPage.isRunning(), "The load should have completed");
	deepEqual(testSubject(), data, "The data should have been loaded now");
	equal(testSubject.totalRows(), 99, "totalRows should have been updated");
});

test("load a new page", function() {
	var loading = $.Deferred(),
		data = [1, 2, 3],
		testSubject = Utils.pagedList({
			loadPage: function (pageIndex, pageSize) {
				equal(pageIndex, 3, "Load should have been called with pageIndex of 3");
				equal(pageSize, 1, "pageSize should have been passed to the loadPage function");
				return loading;
			},
			pageSize: 1,
			firstPage: { rows: [] } //include firstPage to avoid initial load
		});

	//call loadPage
	testSubject.loadPage(3);

	//check the current state
	ok(testSubject.loadPage.isRunning(), "The load should be running");
	deepEqual(testSubject(), [], "The page should be empty until load completes");

	//allow the load to complete
	loading.resolve({
		rows: data,
		totalRows: 99
	});

	//check that we are no longer running the load
	ok(!testSubject.loadPage.isRunning(), "The load should have completed");
	deepEqual(testSubject(), data, "The data should have been loaded now");
	equal(testSubject.totalRows(), 99, "totalRows should have been updated");
	equal(testSubject.pageCount(), 99, "pageCount should be recalculated after a load");
});

test("change pageSize causes re-load", function() {
	var loading = $.Deferred(),
		loadCount = 0,
		data = [1, 2],
		testSubject = Utils.pagedList({
			loadPage: function (pageIndex, pageSize) {
				equal(pageIndex, 0, "Load should have been passed pageIndex of zero");
				equal(pageSize, 2, "pageSize should have been passed to the loadPage function");
				loadCount++;
				return loading;
			},
			firstPage: { rows: []} //include firstPage to avoid initial load
		});

	//fake setting the current page to something other than 0
	testSubject.pageIndex(10);

	//set the page size
	testSubject.pageSize(2);

	//check the current state
	ok(testSubject.loadPage.isRunning(), "The load should be running");
	deepEqual(testSubject(), [], "The page should be empty until load completes");

	//allow the load to complete
	loading.resolve({
		rows: data,
		totalRows: 99
	});

	//check that we are no longer running the load and that pgeIndex was reset
	ok(!testSubject.loadPage.isRunning(), "The load should have completed");
	deepEqual(testSubject(), data, "The data should have been loaded now");
	equal(testSubject.totalRows(), 99, "totalRows should have been updated");
	equal(testSubject.pageIndex(), 0, "pageIndex should have been reset");

	//check that load was only called once
	equal(loadCount, 1, "load should only have been called once");

});

test("map function is used if specified", function() {
	var data = [1, 2, 3, 4, 5],
		testSubject = Utils.pagedList({
			loadPage: function () { },
			map: function(source) {
				return {
					sourceData: source
				};
			},
			firstPage: {
				rows: data,
				totalRows: 123
			},
			pageSize: 10
		});

	equal(testSubject().length, 5, "5 items should be added to the array");
	equal(testSubject()[0].sourceData, 1, "The map function should have created a new object");
	equal(testSubject()[1].sourceData, 2, "The map function should have created a new object");
	equal(testSubject()[2].sourceData, 3, "The map function should have created a new object");
	equal(testSubject()[3].sourceData, 4, "The map function should have created a new object");
	equal(testSubject()[4].sourceData, 5, "The map function should have created a new object");
});

test("nextPage does nothing when on last page", function() {
	var loadCalled = false,
		testSubject = Utils.pagedList({
			loadPage: function(pageIndex, pageSize) {
				loadCalled = true;
			},
			firstPage: { rows: [] }
		});

	//manually set the totalRows and pageIndex to get to the last page
	testSubject.totalRows(100);
	testSubject.pageIndex(10);

	//call nextPage
	testSubject.nextPage();

	//check nothing changed
	equal(testSubject.pageIndex(), 10, "pageIndex should not have changed");
	ok(!loadCalled, "loadPage should not have been called");
});

test("nextPage loads the next page of data when pagecount is unknown", function() {
	var loading = $.Deferred(),
		testSubject = Utils.pagedList({
			loadPage: function(pageIndex, pageSize) {
				equal(pageIndex, 1, "pageIndex should have been set to the next page");
				equal(pageSize, 10, "pageSize should be passed to the loadPage function");
				return loading;
			},
			firstPage: { rows: [] }
		});

	//call nextPage
	testSubject.nextPage();

	//check the current state - running but not updated yet
	ok(testSubject.loadPage.isRunning(), "The load should be running");
	deepEqual(testSubject(), [], "The page should be empty until load completes");
	equal(testSubject.pageIndex(), 0, "The page index should not be updated until load completes");

	//allow the load to complete
	loading.resolve({ rows: [1, 2, 3] });

	//check that we are no longer running the load
	ok(!testSubject.loadPage.isRunning(), "The load should have completed");
	deepEqual(testSubject(), [1,2,3], "The data should have been updated");
	equal(testSubject.pageIndex(), 1, "The page index should now have been updated");
});

test("nextPage loads the next page of data when pagecount is valid", function () {
	var loading = $.Deferred(),
		testSubject = Utils.pagedList({
			loadPage: function (pageIndex, pageSize) {
				equal(pageIndex, 3, "pageIndex should have been set to the next page");
				equal(pageSize, 10, "pageSize should be passed to the loadPage function");
				return loading;
			},
			firstPage: { rows: [] }
		});

	//force the pagecount to be a non-negative valid value
	testSubject.totalRows(100);
	testSubject.pageIndex(2);

	//call nextPage
	testSubject.nextPage();

	//check the current state - running but not updated yet
	ok(testSubject.loadPage.isRunning(), "The load should be running");
	deepEqual(testSubject(), [], "The page should be empty until load completes");
	equal(testSubject.pageIndex(), 2, "The page index should not be updated until load completes");

	//allow the load to complete
	loading.resolve({ rows: [1, 2, 3] });

	//check that we are no longer running the load
	ok(!testSubject.loadPage.isRunning(), "The load should have completed");
	deepEqual(testSubject(), [1, 2, 3], "The data should have been updated");
	equal(testSubject.pageIndex(), 3, "The page index should now have been updated");
});

test("previousPage does nothing when on first page", function() {
	var loadCalled = false,
		testSubject = Utils.pagedList({
			loadPage: function (pageIndex, pageSize) {
				loadCalled = true;
			},
			firstPage: { rows: [] }
		});

	//call previousPage
	testSubject.previousPage();

	//check nothing changed
	equal(testSubject.pageIndex(), 0, "pageIndex should not have changed");
	ok(!loadCalled, "loadPage should not have been called");
});

test("previousPage loads the previous page of data when pagecount is valid", function () {
	var loading = $.Deferred(),
		testSubject = Utils.pagedList({
			loadPage: function (pageIndex, pageSize) {
				equal(pageIndex, 1, "pageIndex should have been set to the next page");
				equal(pageSize, 10, "pageSize should be passed to the loadPage function");
				return loading;
			},
			firstPage: { rows: [] }
		});

	//force the pagecount to be a non-negative valid value
	testSubject.totalRows(100);
	testSubject.pageIndex(2);

	//call previousPage
	testSubject.previousPage();

	//check the current state - running but not updated yet
	ok(testSubject.loadPage.isRunning(), "The load should be running");
	deepEqual(testSubject(), [], "The page should be empty until load completes");
	equal(testSubject.pageIndex(), 2, "The page index should not be updated until load completes");

	//allow the load to complete
	loading.resolve({ rows: [1, 2, 3] });

	//check that we are no longer running the load
	ok(!testSubject.loadPage.isRunning(), "The load should have completed");
	deepEqual(testSubject(), [1, 2, 3], "The data should have been updated");
	equal(testSubject.pageIndex(), 1, "The page index should now have been updated");
});

test("done handlers are called on loadPage", function () {
    var loading = $.Deferred(),
		testSubject = Utils.pagedList({
		    loadPage: function (pageIndex, pageSize) {
		        return loading;
		    },
		    firstPage: { rows: [] }
		}),
        doneHandlerCalled = false,
		dataToReturn = { rows: [] };

    testSubject.loadPage(0).done(function (data) {
        doneHandlerCalled = true;
        equal(data, dataToReturn, "The data passed to the done handler should be the result of load page");
    });

    ok(!doneHandlerCalled, "Done handler shouldn't be called yet");

    loading.resolve(dataToReturn);

    ok(doneHandlerCalled, "Done handler should have been called");


});