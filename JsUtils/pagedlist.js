/*global ko: false*/

(function (window, ko, undefined) {
    "use strict";

    window.Utils = window.Utils || {};

    ko.pagedList = window.Utils.pagedList = function(options) {
        if (!options) { throw "Options not specified"; }
        if (!options.loadPage) { throw "loadPage not specified on options"; }

		var //page size
			_pageSize = ko.observable(options.pageSize || 10),

			//current page index
			_pageIndex = ko.observable(0),

			//the total number of rows, defaulting to -1 indicating unknown
			_totalRows = ko.observable(-1),

			//observable containing current page data.  Using observable instead of observableArray as
			//all this will do is present data
			_page = ko.observable([]),

			//load a page of data, then display it
			_loadPage = window.Utils.command(function(pageIndex) {
				var promise = options.loadPage(pageIndex, _pageSize());
				if (!promise.pipe) { throw "loadPage should return a promise"; }

				return promise.pipe(_displayPage).done(function() {
					_pageIndex(pageIndex);
				});
			}),

			//display a page of data
			_displayPage = function(result) {
			    if (!result) { throw "No page results"; }
			    if (!result.rows) { throw "Result should contain rows array"; }

				if (options.map) {
					_page($.map(result.rows, options.map));
				} else {
					_page(result.rows);
				}

				//save the total row count if it was returned
				if (result.totalRows) {
					_totalRows(result.totalRows);
				}

				return result;
			},

			//the number of pages
			_pageCount = ko.computed(function() {
			    if (_totalRows() === -1) { return -1; }

				return Math.ceil(_totalRows() / _pageSize()) || 1;
			}),

			//command to move to the next page
			_nextPage = function() {
				var currentIndex = _pageIndex(),
					pageCount = _pageCount();
				if (pageCount === -1 || currentIndex < (pageCount - 1)) {
					_loadPage(currentIndex + 1);
				}
			},

			//command to move to the previous page
			_previousPage = function() {
				var targetIndex = _pageIndex() - 1;
				if (targetIndex >= 0) {
					_loadPage(targetIndex);
				}
			};

		//reset page index when page size changes
		_pageSize.subscribe(function() {
			_loadPage(0);
		});

		//populate with default data if specified
		if (options.firstPage) {
			_displayPage(options.firstPage);
		} else {
			_loadPage(0);
		}

		//public members
		_page.pageSize     = _pageSize;
		_page.pageIndex    = _pageIndex;
		_page.pageCount    = _pageCount;
		_page.totalRows    = _totalRows;
		_page.nextPage     = _nextPage;
		_page.previousPage = _previousPage;
		_page.loadPage     = _loadPage;

		return _page;
	};
}(window, ko));