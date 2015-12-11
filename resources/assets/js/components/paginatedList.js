var helpers = require('../utils/helpers.js');

module.exports = {
    template: require('./paginatedList.template.html'),

    props: ['params'],

    data: function() {
        return {
            itemsPerPageOptions: [5, 10, 20, 50, 100],
            visiblePagesCount: 3,
            listState: {
                //pagination
                currentPageIndex: 0,
                currentStartIndex: 0,
                itemsPerPage: 10,
                //search
                filterText: '',
                //sort
                sortByIndex: 0,
                reverseSort: false
            },
            listItemsType: ''
        };
    },

    attached: function() {
        this.listItemsType = this.params.type;
        if ((this.params.type == '') || !localStorage[this.params.type]) return;

        this.listState = JSON.parse(localStorage[this.params.type]);

        this.parseData();

        //validate saved list state
        if (this.listState.currentPageIndex >= this.pagesCount) this.listState.currentPageIndex = this.pagesCount;
    },

    beforeDestroy: function() {
        if (this.params.type == '') return;

        localStorage[this.params.type] = JSON.stringify(this.listState);
    },

    computed: {
        pagesCount: function() {
            if (this.listState.itemsPerPage && this.params.data)
                return Math.ceil(this.filteredData.length / this.listState.itemsPerPage);
            else return 0;
        },

        filteredData: function() {
            if (!this.params.data) return [];

            return this.$options.filters.filterBy(this.params.data, this.listState.filterText);
        },

        selectablePagesCount: function() {
            return Math.min(this.visiblePagesCount, this.pagesCount);
        },

        allSelected: function() {
            for (var item in this.params.data)
                if (!this.params.data[item].selected) return false;
            return true;
        }
    },

    methods: {
        changePage: function(pageIndex) {
            if (pageIndex != this.listState.currentPageIndex)
            {
                var cachePagesCount = this.pagesCount;
                if (pageIndex < 0) pageIndex = 0;
                if (pageIndex >= cachePagesCount) pageIndex = cachePagesCount - 1;
                while (pageIndex >= (this.listState.currentStartIndex + this.selectablePagesCount)) this.listState.currentStartIndex += this.selectablePagesCount;
                while (pageIndex < this.listState.currentStartIndex) this.listState.currentStartIndex -= this.selectablePagesCount;
                if (this.listState.currentStartIndex < 0) this.listState.currentStartIndex = 0;
                if ((this.listState.currentStartIndex + this.selectablePagesCount) >= cachePagesCount) this.listState.currentStartIndex = cachePagesCount - this.selectablePagesCount;
                this.listState.currentPageIndex = pageIndex;
            }
        },

        sortBy: function(columnIndex) {
            if (this.listState.sortByIndex == columnIndex) this.listState.reverseSort = !this.listState.reverseSort;
            else {
                this.listState.reverseSort = false;
                this.listState.sortByIndex = columnIndex;
            }
        },

        itemClick: function(clickedObject) {
            this.$dispatch('list-item-click', clickedObject.id);
        },

        itemChecked: function(checkedObject) {
            event.stopPropagation();
            if (event.target.type != 'checkbox')
                checkedObject.selected = !checkedObject.selected;
        },

        toggleSelectAll: function() {
            var toggleValue = !this.allSelected;
            for (var item in this.params.data) this.params.data[item].selected = toggleValue;
        },

        parseData: function(data) {
            if (data === true)
                data = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
            else if (data === false)
                data = '';
            else if (data != undefined)
                data = helpers.parseForXSS(data);

            return data;
        }
    },

    filters: {
        paginate: function(list) {
            return list.slice(this.listState.currentPageIndex * this.listState.itemsPerPage, (this.listState.currentPageIndex + 1) * this.listState.itemsPerPage);
        }
    }
};