Snake.Views.Join = Backbone.View.extend({

    el: '#join',

    events: {
        'click #join-player-button': '_onJoinClick'
    },

    fields: null,

    initialize: function (options) {
        this.template = _.template($('#template-join').html());
        this.model.on('join', this.disable, this);
        this.fields = {};
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.fields.input = this.$el.find('#join-player-name');
        this.fields.button = this.$el.find('#join-player-button');
        return this;
    },

    enable: function () {
        _.each(this.fields, function (field) {
            field.removeAttr('disabled');
        });
    },

    disable: function () {
        _.each(this.fields, function (field) {
            field.attr('disabled', 'disabled');
        });
    },

    _onJoinClick: function () {
        if (this.fields.input.val() === '') {
            alert('Please enter a player name');
        } else {
            this.model.set({ name: this.fields.input.val() });
            this.model.trigger('join', this.model);
        }
    }
});