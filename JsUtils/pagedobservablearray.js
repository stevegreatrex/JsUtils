/*global ko: false*/

(function (window, ko, undefined) {
    "use strict";

    window.Utils = window.Utils || {};

    window.Utils.PagedObservableArray = function (options) {
        options = options || {};

        if ($.isArray(options)) {
            options = { data: options };
        }

        var
		//the complete data collection
	        _allData = ko.observableArray(options.data || []),

		//the size of the pages to display
	        _pageSize = ko.observable(options.pageSize || 10),

		//the index of the current page
	        _pageIndex = ko.observable(0),

		//the current page data
	        _page = ko.computed(function () {
	            var pageSize = _pageSize(),
	                pageIndex = _pageIndex(),
	                startIndex = pageSize * pageIndex,
	                endIndex = pageSize * (pageIndex + 1);

	            return _allData().slice(startIndex, endIndex);
	        }, this),

		//the number of pages
	        _pageCount = ko.computed(function () {
	            return Math.ceil(_allData().length / _pageSize()) || 1;
	        }),

		//move to the next page
	        _nextPage = function () {
	            if (_pageIndex() < (_pageCount() - 1)) {
	                _pageIndex(_pageIndex() + 1);
	            }
	        },

		//move to the previous page
	        _previousPage = function () {
	            if (_pageIndex() > 0) {
	                _pageIndex(_pageIndex() - 1);
	            }
	        };

        //reset page index when page size changes
        _pageSize.subscribe(function () { _pageIndex(0); });
        _allData.subscribe(function () { _pageIndex(0); });

        //public members
        this.allData = _allData;
        this.pageSize = _pageSize;
        this.pageIndex = _pageIndex;
        this.page = _page;
        this.pageCount = _pageCount;
        this.nextPage = _nextPage;
        this.previousPage = _previousPage;
    };
}(window, ko));