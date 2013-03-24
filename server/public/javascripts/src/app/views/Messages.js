Snake.Views.Messages = (function () {

    var statics = {
        MESSAGE: 'message',
        ALERT: 'alert',
        ERROR: 'error'
    };

    var Messages = Backbone.View.extend({

        el: '#messages',

        events: {

        },

        flash: function (message, duration, type) {
            duration = duration || 3000;
            this.render(message, type);
            setTimeout(_.bind(function () {
                this.clear();
            }, this), duration);
        },

        render: function (message, type) {
            type = type || statics.MESSAGE;
            this.$el
                .empty()
                .removeClass()
                .addClass([type, 'visible'].join(' '))
                .append($('<div />').attr('id', 'message-inner').html(message));
            return this;
        },

        clear: function () {
            this.$el.empty().removeClass();
        }

    }, statics);

    return Messages;
}());