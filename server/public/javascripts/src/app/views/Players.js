Snake.Views.Players = (function () {

    var Players = Backbone.View.extend({

        el: '#players',

        events: {

        },

        initialize: function (options) {
            this.template = _.template($('#template-player').html());
            this.model.on('reset', this.render, this);
        },

        render: function () {
            this.$el.empty();
            this.model.each(function (player) {
                this.$el.append(this.template(player.toJSON()));
            }, this);
            return this;
        }
    });

    return Players;
}());