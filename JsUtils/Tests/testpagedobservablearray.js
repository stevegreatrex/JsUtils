module("PagedObservableArray Tests");

test("allData is empty when null is passed to the constructor", function () {
	var testSubject = new Utils.PagedObservableArray();
	equal(testSubject.allData().length, 0, "allData should be an empty array");
});

test("allData contains data specified in constructor", function () {
	var data = [1, 2, 3],
		testSubject = new Utils.PagedObservableArray(data);

	deepEqual(testSubject.allData(), data, "allData should contain the constructor-specified data");
});

test("allData contains data specified in constructor options", function () {
	var data = [1, 2, 3],
		testSubject = new Utils.PagedObservableArray({
			data: data
		});

	deepEqual(testSubject.allData(), data, "allData should contain the constructor-specified data");
});

test("pageSize defaults to 10", function () {
	var testSubject = new Utils.PagedObservableArray();

	equal(testSubject.pageSize(), 10, "pageSize should default to 10");
});

test("pageSize is set to constructor options value", function () {
	var testSubject = new Utils.PagedObservableArray({ pageSize: 20 });

	equal(testSubject.pageSize(), 20, "pageSize should be set to the value from the constructor options");
});

test("pageIndex is initially zero", function () {
	var testSubject = new Utils.PagedObservableArray();

	equal(testSubject.pageIndex(), 0, "pageIndex should default to zero");
});

test("page contains all data when data is less than page size", function () {
	var data = [1, 2, 3],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 3 });

	deepEqual(testSubject.page(), data, "page should contain all data when it is less than the page size");
});

test("page contains only current page data when there is more than one page", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 3 });

	deepEqual(testSubject.page(), [1, 2, 3], "Only the first page of data should be displayed");
});

test("page contents updates when pageIndex is updated", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		pageSubscribersNotified = false,
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 3 });

	//hook up to make sure subscribers are notified
	testSubject.page.subscribe(function () { pageSubscribersNotified = true; });

	//change the page
	testSubject.pageIndex(2);

	//check we were notified
	equal(pageSubscribersNotified, true, "Subscribers should have been notified");

	//check that page contains the correct data
	deepEqual(testSubject.page(), [7, 8, 9], "The third page of data should be displayed");
});

test("page contents updates when pageSize is updated", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		pageSubscribersNotified = false,
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 3 });

	//hook up to make sure subscribers are notified
	testSubject.page.subscribe(function () { pageSubscribersNotified = true; });

	//change the page size
	testSubject.pageSize(4);

	//check we were notified
	equal(pageSubscribersNotified, true, "Subscribers should have been notified");

	//check that page contains the correct data
	deepEqual(testSubject.page(), [1, 2, 3, 4], "The new-sized first page should be displayed");
});

test("pageIndex reverts to 0 when page size changes", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 3 });

	//move to page 2
	testSubject.pageIndex(2);

	//change the page size
	testSubject.pageSize(4);

	//check that page index has returned to zero
	equal(testSubject.pageIndex(), 0, "pageIndex should be reset to 0");
});

test("pageIndex reverts to 0 when all data changes", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 3 });

	//move to page 2
	testSubject.pageIndex(2);

	//add an item
	testSubject.allData.push(11);

	//check that page index has returned to zero
	equal(testSubject.pageIndex(), 0, "pageIndex should be reset to 0");
});

test("page displays partial pages", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 4 });

	testSubject.pageIndex(2);

	deepEqual(testSubject.page(), [9, 10], "Only a partial page should be displayed");
});

test("page returns empty list for invalid page indices", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 4 });

	testSubject.pageIndex(-1);
	deepEqual(testSubject.page(), [], "Empty data should be returned");

	testSubject.pageIndex(100);
	deepEqual(testSubject.page(), [], "Empty data should be returned");
});

test("pageCount is correct", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 4 });

	equal(testSubject.pageCount(), 3, "Should have 3 pages of 4");

	//add some items
	testSubject.allData.push(11);
	testSubject.allData.push(12);
	equal(testSubject.pageCount(), 3, "Should have 3 pages of 4");
	testSubject.allData.push(13);
	equal(testSubject.pageCount(), 4, "Should have 4 pages of 4");

	//change the page size
	testSubject.pageSize(10);
	equal(testSubject.pageCount(), 2, "Should have 2 pages of 10");

	//change the page size and remove some items
	testSubject.pageSize(1);
	equal(testSubject.pageCount(), 13, "Should have 13 pages");

	testSubject.allData.remove(testSubject.allData()[0]);
	equal(testSubject.pageCount(), 12, "Should have 12 pages");

	testSubject.allData.remove(testSubject.allData()[0]);
	equal(testSubject.pageCount(), 11, "Should have 11 pages");

	//check that we can never get to zero pages
	testSubject.allData.removeAll();
	equal(testSubject.pageCount(), 1, "Should always have at least one page");
});

test("nextPage moves to the next page", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 4 });

	equal(testSubject.pageIndex(), 0, "Should start on page 0");

	testSubject.nextPage();
	equal(testSubject.pageIndex(), 1, "Should move to page 1");

	testSubject.nextPage();
	equal(testSubject.pageIndex(), 2, "Should move to page 2");

	testSubject.nextPage();
	equal(testSubject.pageIndex(), 2, "Should have no effect when already on last page");
});

test("previousPage moves to the previous page", function () {
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		testSubject = new Utils.PagedObservableArray({ data: data, pageSize: 4 });

	testSubject.pageIndex(2);

	testSubject.previousPage();
	equal(testSubject.pageIndex(), 1, "Should move to page 1");

	testSubject.previousPage();
	equal(testSubject.pageIndex(), 0, "Should move to page 0");

	testSubject.previousPage();
	equal(testSubject.pageIndex(), 0, "Should have no effect when already on first page");
});