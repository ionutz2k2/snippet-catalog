(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//var Vue = require('vue');
require('./utils/extensions.js');
var state = require('./state');

var app = Vue.extend({
    el: function el() {
        return 'body';
    },

    components: {
        'loading-view': require('./components/loading')
    },

    mixins: [require('./modules/messages-controller')],

    data: function data() {
        return {
            state: state,
            isLoading: false,
            preventLoading: false,
            params: {},
            actions: []
        };
    },

    ready: function ready() {
        this.registerEventListeners();
        this.showStartPage();
    },

    methods: {
        registerEventListeners: function registerEventListeners() {
            $(document).bind('ajaxSend', (function () {
                if (this.preventLoading) {
                    this.preventLoading = false;
                    return;
                }
                this.isLoading = true;
            }).bind(this)).bind('ajaxStop', (function () {
                this.isLoading = false;
            }).bind(this)).bind('ajaxComplete', (function (e, responseData, settings) {
                if (settings.suppressMessages) return;

                if (responseData.responseJSON !== undefined && responseData.responseJSON.messages !== undefined) {
                    for (var messageType in responseData.responseJSON.messages) {
                        for (var messageIndex in responseData.responseJSON.messages[messageType]) {
                            this.$emit(messageType + '-message', responseData.responseJSON.messages[messageType][messageIndex]);
                        }
                    }
                }
            }).bind(this));

            this.$on('error-message', this.showErrorMessage);
            this.$on('general-message', this.showGeneralMessage);
            this.$on('warning-message', this.showWarningMessage);
            this.$on('success-message', this.showSuccessMessage);

            this.$on('buttons-update', (function (buttons) {
                this.actions = buttons;
            }).bind(this));
        },

        showStartPage: function showStartPage() {
            router.go('/snippets');
        }
    }
});

var router = new VueRouter();

router.map({
    '/snippets': {
        component: require('./pages/snippets-list')
    },
    '/snippets/edit/:id': {
        component: require('./pages/snippet-details'),
        name: 'snippet-details'
    },
    '/snippets/create': {
        component: require('./pages/snippet-details')
    }
});

router.start(app, 'body');

},{"./components/loading":2,"./modules/messages-controller":7,"./pages/snippet-details":8,"./pages/snippets-list":10,"./state":12,"./utils/extensions.js":15}],2:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./loading.template.html')
};

},{"./loading.template.html":3}],3:[function(require,module,exports){
module.exports = '<div class="modal-form-container loading">\n    <div class="modal-background loading-background">\n    </div>\n    <div class="container loading-content">\n        <div class="row">\n            <div class="col-sm-12">\n                <h4 class="text-center"><small>Loading...</small></h4>\n                <div class="progress">\n                    <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n';
},{}],4:[function(require,module,exports){
'use strict';

var helpers = require('../utils/helpers.js');

module.exports = {
    template: require('./paginatedList.template.html'),

    props: ['params'],

    data: function data() {
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

    attached: function attached() {
        this.listItemsType = this.params.type;
        if (this.params.type == '' || !localStorage[this.params.type]) return;

        this.listState = JSON.parse(localStorage[this.params.type]);

        this.parseData();

        //validate saved list state
        if (this.listState.currentPageIndex >= this.pagesCount) this.listState.currentPageIndex = this.pagesCount;
    },

    beforeDestroy: function beforeDestroy() {
        if (this.params.type == '') return;

        localStorage[this.params.type] = JSON.stringify(this.listState);
    },

    computed: {
        pagesCount: function pagesCount() {
            if (this.listState.itemsPerPage && this.params.data) return Math.ceil(this.filteredData.length / this.listState.itemsPerPage);else return 0;
        },

        filteredData: function filteredData() {
            if (!this.params.data) return [];

            return this.$options.filters.filterBy(this.params.data, this.listState.filterText);
        },

        selectablePagesCount: function selectablePagesCount() {
            return Math.min(this.visiblePagesCount, this.pagesCount);
        },

        allSelected: function allSelected() {
            for (var item in this.params.data) {
                if (!this.params.data[item].selected) return false;
            }return true;
        }
    },

    methods: {
        changePage: function changePage(pageIndex) {
            if (pageIndex != this.listState.currentPageIndex) {
                var cachePagesCount = this.pagesCount;
                if (pageIndex < 0) pageIndex = 0;
                if (pageIndex >= cachePagesCount) pageIndex = cachePagesCount - 1;
                while (pageIndex >= this.listState.currentStartIndex + this.selectablePagesCount) {
                    this.listState.currentStartIndex += this.selectablePagesCount;
                }while (pageIndex < this.listState.currentStartIndex) {
                    this.listState.currentStartIndex -= this.selectablePagesCount;
                }if (this.listState.currentStartIndex < 0) this.listState.currentStartIndex = 0;
                if (this.listState.currentStartIndex + this.selectablePagesCount >= cachePagesCount) this.listState.currentStartIndex = cachePagesCount - this.selectablePagesCount;
                this.listState.currentPageIndex = pageIndex;
            }
        },

        sortBy: function sortBy(columnIndex) {
            if (this.listState.sortByIndex == columnIndex) this.listState.reverseSort = !this.listState.reverseSort;else {
                this.listState.reverseSort = false;
                this.listState.sortByIndex = columnIndex;
            }
        },

        itemClick: function itemClick(clickedObject) {
            this.$dispatch('list-item-click', clickedObject.id);
        },

        itemChecked: function itemChecked(checkedObject) {
            event.stopPropagation();
            if (event.target.type != 'checkbox') checkedObject.selected = !checkedObject.selected;
        },

        toggleSelectAll: function toggleSelectAll() {
            var toggleValue = !this.allSelected;
            for (var item in this.params.data) {
                this.params.data[item].selected = toggleValue;
            }
        },

        parseData: function parseData(data) {
            if (data === true) data = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';else if (data === false) data = '';else if (data != undefined) data = helpers.parseForXSS(data);

            return data;
        }
    },

    filters: {
        paginate: function paginate(list) {
            return list.slice(this.listState.currentPageIndex * this.listState.itemsPerPage, (this.listState.currentPageIndex + 1) * this.listState.itemsPerPage);
        }
    }
};

},{"../utils/helpers.js":16,"./paginatedList.template.html":5}],5:[function(require,module,exports){
module.exports = '<div class="tool-bar">\n    <div class="container">\n        <h3>{{ params.title }}</h3>\n        <form class="form-inline">\n            <div class="form-group has-feedback">\n                <label class="sr-only" for="search_input">Search</label>\n                <span class="glyphicon glyphicon-search" aria-hidden="true"></span>\n                <input type="text" class="form-control" id="search_input" placeholder="Search..." v-model="listState.filterText">\n                <span id="clearSearchText"\n                      class="glyphicon glyphicon-remove form-control-feedback"\n                      aria-hidden="true"\n                      v-on="click: listState.filterText = \'\';"></span>\n            </div>\n        </form>\n        <nav class="pagination-nav" v-if="pagesCount > 1">\n            <ul class="pagination navbar-right">\n                <li>\n                    <a href="#" aria-label="Previous" v-on="click: changePage(0)">\n                        <span aria-hidden="true">&leftarrow;</span>\n                    </a>\n                </li>\n                <li v-if="pagesCount > selectablePagesCount">\n                    <a href="#" aria-label="Previous" v-on="click: changePage(listState.currentPageIndex - selectablePagesCount)">\n                        <span aria-hidden="true">&laquo;</span>\n                    </a>\n                </li>\n                <li v-repeat="selectablePagesCount" v-class="active: ($index + listState.currentStartIndex) === listState.currentPageIndex"><a href="#" v-on="click: changePage($index + listState.currentStartIndex)">{{ $index + listState.currentStartIndex + 1 }}</a></li>\n                <li v-if="pagesCount > selectablePagesCount">\n                    <a href="#" aria-label="Next" v-on="click: changePage(listState.currentPageIndex + selectablePagesCount)">\n                        <span aria-hidden="true">&raquo;</span>\n                    </a>\n                </li>\n                <li>\n                    <a href="#" aria-label="Previous" v-on="click: changePage(pagesCount - 1)">\n                        <span aria-hidden="true">&rightarrow;</span>\n                    </a>\n                </li>\n            </ul>\n            <div class="pages-hint">Page {{ listState.currentPageIndex + 1 }} of {{ pagesCount }}</div>\n        </nav>\n        <form class="form-inline paginator-config">\n            <label for="itemsPerPageSelect">items per page</label>\n            <select id="itemsPerPageSelect" class="form-control" v-model="listState.itemsPerPage" options="itemsPerPageOptions"></select>\n        </form>\n    </div>\n</div>\n<div class="container paginated-list-container">\n    <div class="well text-center" v-if="!params.columns || !params.columns.length">You have no items created yet. Click on the <strong>Create</strong> button to start adding new items.</div>\n    <div class="table-responsive clear" v-if="params.columns && params.columns.length">\n        <table class="table table-striped table-hover">\n            <thead>\n                <tr>\n                    <th>\n                        <input type="checkbox"\n                               v-model="allSelected"\n                               v-on="click: toggleSelectAll()">\n                    </th>\n                    <th v-repeat="column: params.columns" class="text-nowrap"\n                        v-on="click: sortBy($index)">\n                        {{column | columnate | capitalize}}\n                        <i class="fa"\n                           v-class="fa-sort: $index != listState.sortByIndex,\n                                    fa-sort-asc: ($index == listState.sortByIndex) && !listState.reverseSort,\n                                    fa-sort-desc: ($index == listState.sortByIndex) && listState.reverseSort"></i>\n                    </th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr v-if="params.columns && !filteredData.length">\n                    <td colspan="{{params.columns.length + 1}}" class="text-center">No results found.</td>\n                </tr>\n                <tr v-repeat="entry: params.data | filterBy listState.filterText | orderBy params.columns[listState.sortByIndex] listState.reverseSort | paginate">\n                    <td v-on="click: itemChecked(entry)">\n                        <input type="checkbox"\n                               v-model="entry.selected"\n                        >\n                    </td>\n                    <td v-repeat="column: params.columns">\n                        <a v-link="{name: \'snippet-details\', params: { \'id\': entry.id }}">\n                            <div>{{{ parseData(entry[column]) }}}</div>\n                        </a>\n                    </td>\n                </tr>\n            </tbody>\n        </table>\n    </div>\n</div>';
},{}],6:[function(require,module,exports){
"use strict";

module.exports = {
    ERROR_MESSAGE: 0,
    WARNING_MESSAGE: 1,
    GENERAL_MESSAGE: 2,
    SUCCESS_MESSAGE: 3
};

},{}],7:[function(require,module,exports){
'use strict';

/**
 * Messages module
 *
 * Implements functionality for managing a messages queue.
 * The queue is constructed so it can easily be used in a bootstrap enabled application
 *
 */

var constants = require('../defines');

module.exports = {
    data: function data() {
        return {
            messages: []
        };
    },

    methods: {
        showMessage: function showMessage(message, type, time) {
            if (message === undefined || message.trim() == '') return;
            time = time === undefined ? 10000 : time;

            var newMessage = {};
            newMessage.messageText = message;
            switch (type) {
                case constants.ERROR_MESSAGE:
                    newMessage.messageType = { 'alert-danger': true };
                    break;
                case constants.WARNING_MESSAGE:
                    newMessage.messageType = { 'alert-warning': true };
                    break;
                case constants.GENERAL_MESSAGE:
                    newMessage.messageType = { 'alert-info': true };
                    break;
                case constants.SUCCESS_MESSAGE:
                    newMessage.messageType = { 'alert-success': true };
                    break;
            }
            this.messages.push(newMessage);
            if (time > 0) setTimeout((function () {
                this.messages.$remove(0);
            }).bind(this), time);
        },

        showErrorMessage: function showErrorMessage(message, time) {
            this.showMessage(message, constants.ERROR_MESSAGE, time);
        },

        showWarningMessage: function showWarningMessage(message, time) {
            this.showMessage(message, constants.WARNING_MESSAGE, time);
        },

        showGeneralMessage: function showGeneralMessage(message, time) {
            this.showMessage(message, constants.GENERAL_MESSAGE, time);
        },

        showSuccessMessage: function showSuccessMessage(message, time) {
            this.showMessage(message, constants.SUCCESS_MESSAGE, time);
        }
    }
};

},{"../defines":6}],8:[function(require,module,exports){
'use strict';

var ActionButton = require('../utils/button');
var RESTWrapper = require('../utils/REST');
var state = require('../state');

module.exports = {
    template: require('./snippet-details.template.html'),

    data: function data() {
        return {
            resourceData: {
                id: '',
                snippet_name: '',
                snippet_content: '',
                snippet_written_by: ''
            },
            request: null,
            validation: {
                snippet_name: true,
                snippet_content: true,
                snippet_written_by: true
            },
            state: state
        };
    },

    computed: {
        isEditMode: function isEditMode() {
            return this.$route.path.indexOf('/edit/') > 0;
        },

        isAddMode: function isAddMode() {
            return this.$route.path == '/snippets/create';
        }
    },

    attached: function attached() {
        this.request = new RESTWrapper(this, 'api/snippets', this.state.token);

        if (this.isAddMode) {
            this.initButtons();
            return;
        }

        this.resourceData.id = this.$route.params.id;
        this.request.details(this.resourceData.id, this.init.bind(this));
    },

    methods: {
        initButtons: function initButtons() {
            var actionsList = [];
            var button;

            if (this.isEditMode) {
                button = new ActionButton();
                button.initButton('Save Snippet Details', ['blue', 'left'], this.save);
                actionsList.push(button);
            }

            if (this.isAddMode) {
                button = new ActionButton();
                button.initButton('Create Snippet', ['blue', 'left'], this.create);
                actionsList.push(button);
            }

            button = new ActionButton();
            button.initButton('Back', ['white', 'right'], this.back);
            actionsList.push(button);

            this.$dispatch('buttons-update', actionsList);
        },

        init: function init(responseData) {
            this.resourceData = responseData.data;
            this.initButtons();
        },

        save: function save() {
            this.request.update(this.resourceData, (function () {
                this.$dispatch('snippet-saved');
                this.back();
            }).bind(this), this.handleValidationErrors);
        },

        create: function create() {
            this.request.create(this.resourceData, (function () {
                this.$dispatch('snippet-created');
                this.back();
            }).bind(this), this.handleValidationErrors);
        },

        handleValidationErrors: function handleValidationErrors(responseData) {
            try {
                for (var i in responseData.responseJSON.messages.error) {
                    if (this.validation[i]) this.validation[i] = false;
                }
            } catch (err) {}
        },

        back: function back() {
            history.back();
        }
    }
};

},{"../state":12,"../utils/REST":13,"../utils/button":14,"./snippet-details.template.html":9}],9:[function(require,module,exports){
module.exports = '<div class="container">\n    <h3>Employee Details</h3>\n    <form>\n        <div class="row">\n            <!-- Snippet Name Field -->\n            <div class="form-group col-sm-12"\n                 v-class="has-error: !validation.snippet_name">\n                <label class="control-label" for="snippet_name">Snippet Name*</label>\n                <input type="text" name="snippet_name" id="snippet_name" class="form-control"\n                       v-model="resourceData.snippet_name"\n                       v-on="keypress: validation.snippet_name = true"\n                        />\n            </div>\n        </div>\n\n        <div class="row">\n            <!-- Snippet Content Field -->\n            <div class="form-group col-sm-12"\n                 v-class="has-error: !validation.snippet_content">\n                <label class="control-label" for="snippet_content">Snippet Content*</label>\n                <textarea name="snippet_content" id="snippet_content" class="form-control" rows="5"\n                          v-model="resourceData.snippet_content"\n                          v-on="keypress: validation.snippet_content = true"\n                        ></textarea>\n            </div>\n        </div>\n\n        <hr />\n\n        <div class="row">\n            <!-- Written By Field -->\n            <div class="form-group col-sm-12"\n                 v-class="has-error: !validation.snippet_written_by">\n                <label class="control-label" for="snippet_written_by">Written By*</label>\n                <input type="text" name="snippet_written_by" id="snippet_written_by" class="form-control"\n                       v-model="resourceData.snippet_written_by"\n                       v-on="keypress: validation.snippet_written_by = true"\n                        />\n            </div>\n        </div>\n\n    </form>\n</div>';
},{}],10:[function(require,module,exports){
'use strict';

var ActionButton = require('../utils/button');
var RESTWrapper = require('../utils/REST');
var state = require('../state');

module.exports = {
    template: require('./snippets-list.template.html'),

    data: function data() {
        return {
            parsedData: {
                columns: null,
                data: null,
                title: 'Snippets List'
            },
            state: state,
            request: null
        };
    },

    attached: function attached() {
        this.request = new RESTWrapper(this, 'api/snippets', this.state.token);
        this.init();
    },

    methods: {
        init: function init() {
            this.request.getAll(this.initData.bind(this));
        },

        initButtons: function initButtons() {
            var actionsList = [];
            var button;

            button = new ActionButton();
            button.initButton('Create', ['blue', 'left'], this.add);
            actionsList.push(button);

            button = new ActionButton();
            button.initButton('Delete Selected', ['red', 'left'], this.delete);
            actionsList.push(button);

            this.$dispatch('buttons-update', actionsList);
        },

        initData: function initData(responseData) {
            this.parsedData.data = responseData.data;
            this.parsedData.columns = [];
            this.initButtons();
            if (this.parsedData.data.length >= 1) {
                for (var key in this.parsedData.data[0]) {
                    this.parsedData.columns.push(key);
                }for (var item in this.parsedData.data) {
                    this.parsedData.data[item].$set('selected', false);
                }
            }
        },

        add: function add() {
            this.$route.router.go('/snippets/create');
        },

        delete: function _delete() {
            var selectedIDs = [];
            for (var item in this.parsedData.data) {
                if (this.parsedData.data[item].selected) selectedIDs.push(this.parsedData.data[item].id);
            }if (selectedIDs.length == 0) this.$dispatch('warning-message', 'You haven\'t selected any items to be deleted. Select the items you want to delete by clicking on the checkbox next to them.');else if (selectedIDs.length > 50) this.$dispatch('warning-message', 'You are not allowed to delete more than 50 items at one time.');else this.request.delete(selectedIDs.join(','), (function () {
                this.$dispatch('deleted');
                this.init();
            }).bind(this));
        },

        back: function back() {
            this.$dispatch('back');
        }
    },

    components: {
        'paginated-list': require('../components/paginatedList')
    }
};

},{"../components/paginatedList":4,"../state":12,"../utils/REST":13,"../utils/button":14,"./snippets-list.template.html":11}],11:[function(require,module,exports){
module.exports = '<paginated-list params="{{parsedData}}"></paginated-list>';
},{}],12:[function(require,module,exports){
'use strict';

module.exports = {
    token: ''
};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = function (vueInstance, resourcePath, csrf) {
    function prepareData(data) {
        for (var i in data) {
            if (typeof data[i] == 'boolean') data[i] = data[i] ? 1 : 0;
        }if (csrf) {
            if (data instanceof FormData) data.append('_token', csrf);else data._token = csrf;
        }

        return data;
    }

    function call(params, successCallback, errorCallback) {
        $.ajax(params).done(successCallback).fail(errorCallback);
    }

    /**
     * Fetches the all items
     *
     * @param successCallback
     * @param errorCallback
     */
    this.getAll = function (successCallback, errorCallback) {
        var params = {
            method: 'GET',
            url: resourcePath
        };
        call(params, successCallback, errorCallback);
    };

    /**
     * Gets all the details for a specific item identified by id
     *
     * @param id
     * @param successCallback
     * @param errorCallback
     */
    this.details = function (id, successCallback, errorCallback) {
        var params = {
            method: 'GET',
            url: resourcePath + '/' + id
        };
        call(params, successCallback, errorCallback);
    };

    /**
     * Creates a new item based on the object received in the data param
     *
     * @param data
     * @param successCallback
     * @param errorCallback
     * @param options
     */
    this.create = function (data, successCallback, errorCallback, options) {
        var params = {
            method: 'POST',
            url: resourcePath,
            data: prepareData(data)
        };
        jQuery.extend(params, options);
        call(params, successCallback, errorCallback);
    };

    /**
     * Saves the changes of an edited item received as an object in the data param
     *
     * @param data
     * @param successCallback
     * @param errorCallback
     */
    this.update = function (data, successCallback, errorCallback) {
        var params = {
            method: 'PUT',
            url: resourcePath + '/' + data.id,
            data: prepareData(data)
        };
        call(params, successCallback, errorCallback);
    };

    /**
     * Deletes one ore more items sent as an object in the data parameter
     * The ids are concatenated in the ids member of the data object
     *
     * @param data
     * @param successCallback
     * @param errorCallback
     */
    this.delete = function (data, successCallback, errorCallback) {
        var params = {
            method: 'DELETE',
            url: resourcePath + '/' + data,
            headers: {
                'X-CSRF-TOKEN': csrf
            }
        };
        call(params, successCallback, errorCallback);
    };
};

},{}],14:[function(require,module,exports){
'use strict';

module.exports = function () {
    this.label = '';
    this.callback = null;
    this.type = null;

    this.initButton = function (label, aspect, action) {
        this.label = label;
        this.callback = action;
        this.type = {};
        for (var i = 0; i < aspect.length; i++) {
            switch (aspect[i]) {
                case 'blue':
                    this.type['btn-primary'] = true;
                    break;
                case 'red':
                    this.type['btn-danger'] = true;
                    break;
                case 'green':
                    this.type['btn-success'] = true;
                    break;
                case 'light-blue':
                    this.type['btn-info'] = true;
                    break;
                case 'orange':
                    this.type['btn-warning'] = true;
                    break;
                case 'white':
                    this.type['btn-default'] = true;
                    break;
                case 'right':
                    this.type['btn-right'] = true;
                    break;
                case 'left':
                    this.type['btn-left'] = true;
                    break;
            }
        }
    };
};

},{}],15:[function(require,module,exports){
'use strict';

(function () {
    String.prototype.ucwords = function () {
        return this.toLowerCase().replace(/\b[a-z]/g, function (letter) {
            return letter.toUpperCase();
        });
    };
})();

Vue.filter('columnate', function (value) {
    return value.replace(/_|-/g, ' ').ucwords();
});

},{}],16:[function(require,module,exports){
'use strict';

exports.getObjectProperty = function (object, property, defaultValue) {
    if (object == undefined || object[property] == undefined) return defaultValue;
    return object[property];
};

exports.parseForXSS = function (value) {
    return String(value).replace(/[\u00A0-\u9999<>&]/gim, function (i) {
        return '&#' + i.charCodeAt(0) + ';';
    });
};

exports.isValidEmail = function (emailAddress) {
    var re = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    return re.test(emailAddress);
};

},{}]},{},[1]);

//# sourceMappingURL=app.js.map
