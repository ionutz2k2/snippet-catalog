//var Vue = require('vue');
require('./utils/extensions.js');
var state = require('./state');

var app = Vue.extend({
    el: function () {
        return 'body';
    },

    components: {
        'loading-view': require('./components/loading')
    },

    mixins: [
        require('./modules/messages-controller')
    ],

    data: function () {
        return {
            state: state,
            isLoading: false,
            preventLoading: false,
            params: {},
            actions: []
        };
    },

    ready: function() {
        this.registerEventListeners();
        this.showStartPage();
    },

    methods:{
        registerEventListeners: function() {
            $(document).bind('ajaxSend', function() {
                if (this.preventLoading) {
                    this.preventLoading = false;
                    return;
                }
                this.isLoading = true;
            }.bind(this)).bind('ajaxStop', function() {
                this.isLoading = false;
            }.bind(this)).bind('ajaxComplete', function(e, responseData, settings) {
                if (settings.suppressMessages) return;

                if ((responseData.responseJSON !== undefined) && (responseData.responseJSON.messages !== undefined))
                {
                    for (var messageType in responseData.responseJSON.messages)
                        for (var messageIndex in responseData.responseJSON.messages[messageType])
                            this.$emit(messageType + '-message', responseData.responseJSON.messages[messageType][messageIndex]);
                }
            }.bind(this));

            this.$on('error-message', this.showErrorMessage);
            this.$on('general-message', this.showGeneralMessage);
            this.$on('warning-message', this.showWarningMessage);
            this.$on('success-message', this.showSuccessMessage);

            this.$on('buttons-update', function(buttons) {
                this.actions = buttons;
            }.bind(this));
        },

        showStartPage: function() {
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