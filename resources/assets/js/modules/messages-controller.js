/**
 * Messages module
 *
 * Implements functionality for managing a messages queue.
 * The queue is constructed so it can easily be used in a bootstrap enabled application
 *
 */

var constants = require('../defines');

module.exports = {
    data: function() {
        return {
            messages: []
        };
    },

    methods: {
        showMessage: function(message, type, time) {
            if (message === undefined || (message.trim() == '')) return;
            time = (time === undefined) ? 10000 : time;

            var newMessage = {};
            newMessage.messageText = message;
            switch (type)
            {
                case constants.ERROR_MESSAGE:
                    newMessage.messageType = {'alert-danger': true};
                    break;
                case constants.WARNING_MESSAGE:
                    newMessage.messageType = {'alert-warning': true};
                    break;
                case constants.GENERAL_MESSAGE:
                    newMessage.messageType = {'alert-info': true};
                    break;
                case constants.SUCCESS_MESSAGE:
                    newMessage.messageType = {'alert-success': true};
                    break;
            }
            this.messages.push(newMessage);
            if (time > 0)
                setTimeout(function() {
                    this.messages.$remove(0);
                }.bind(this), time);
        },

        showErrorMessage: function(message, time) {
            this.showMessage(message, constants.ERROR_MESSAGE, time);
        },

        showWarningMessage: function(message, time) {
            this.showMessage(message, constants.WARNING_MESSAGE, time);
        },

        showGeneralMessage: function(message, time) {
            this.showMessage(message, constants.GENERAL_MESSAGE, time);
        },

        showSuccessMessage: function(message, time) {
            this.showMessage(message, constants.SUCCESS_MESSAGE, time);
        }
    }
};