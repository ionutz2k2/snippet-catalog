var ActionButton = require('../utils/button');
var RESTWrapper = require('../utils/REST');
var state = require('../state');

module.exports = {
    template: require('./snippet-details.template.html'),

    data: function() {
        return {
            resourceData: {
                id: '',
                snippet_name: '',
                snippet_content: '',
                snippet_written_by: '',
            },
            request: null,
            validation: {
                snippet_name: true,
                snippet_content: true,
                snippet_written_by: true,
            },
            state: state
        };
    },

    computed: {
        isEditMode: function () {
            return this.$route.path.indexOf('/edit/') > 0;
        },

        isAddMode: function () {
            return this.$route.path == '/snippets/create';
        }
    },

    attached: function() {
        this.request = new RESTWrapper(this, 'api/snippets', this.state.token);

        if (this.isAddMode) {
            this.initButtons();
            return;
        }

        this.resourceData.id = this.$route.params.id;
        this.request.details(this.resourceData.id, this.init.bind(this));
    },

    methods: {
        initButtons: function() {
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

        init: function(responseData) {
            this.resourceData = responseData.data;
            this.initButtons();
        },

        save: function() {
            this.request.update(this.resourceData, function(){
                this.$dispatch('snippet-saved');
                this.back();
            }.bind(this), this.handleValidationErrors);
        },

        create: function() {
            this.request.create(this.resourceData, function() {
                this.$dispatch('snippet-created');
                this.back();
            }.bind(this), this.handleValidationErrors);
        },

        handleValidationErrors: function(responseData) {
            try {
                for (var i in responseData.responseJSON.messages.error)
                    if (this.validation[i]) this.validation[i] = false;
            }
            catch (err) {}
        },

        back: function() {
            history.back();
        }
    }
};