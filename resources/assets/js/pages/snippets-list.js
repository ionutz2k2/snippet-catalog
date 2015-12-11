var ActionButton = require('../utils/button');
var RESTWrapper = require('../utils/REST');
var state = require('../state');

module.exports = {
    template: require('./snippets-list.template.html'),

    data: function() {
        return {
            parsedData: {
                columns: null,
                data: null,
                title: 'Snippets List',
            },
            state: state,
            request: null
        };
    },

    attached: function() {
        this.request = new RESTWrapper(this, 'api/snippets', this.state.token);
        this.init();
    },

    methods: {
        init: function() {
            this.request.getAll(this.initData.bind(this));
        },

        initButtons: function() {
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

        initData: function(responseData) {
            this.parsedData.data = responseData.data;
            this.parsedData.columns = [];
            this.initButtons();
            if (this.parsedData.data.length >= 1) {
                for (var key in this.parsedData.data[0]) this.parsedData.columns.push(key);
                for (var item in this.parsedData.data) this.parsedData.data[item].$set('selected', false);
            }
        },

        add: function() {
            this.$route.router.go('/snippets/create');
        },

        delete: function() {
            var selectedIDs = [];
            for (var item in this.parsedData.data)
                if (this.parsedData.data[item].selected)
                    selectedIDs.push(this.parsedData.data[item].id);
            if (selectedIDs.length == 0) this.$dispatch('warning-message', 'You haven\'t selected any items to be deleted. Select the items you want to delete by clicking on the checkbox next to them.');
            else if (selectedIDs.length > 50) this.$dispatch('warning-message', 'You are not allowed to delete more than 50 items at one time.');
            else this.request.delete(selectedIDs.join(','), function() {
                    this.$dispatch('deleted');
                    this.init();
                }.bind(this));
        },

        back: function() {
            this.$dispatch('back');
        }
    },

    components: {
        'paginated-list': require('../components/paginatedList')
    }
};