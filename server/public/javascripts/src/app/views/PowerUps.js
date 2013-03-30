Snake.Views.PowerUps = (function () {

    var PowerUps = Backbone.View.extend({

        el: '#powerups',

        events: {

        },

        initialize: function (options) {
            this.template = _.template($('#template-powerup').html());
            this.model.on('reset', this.render, this);
        },

        render: function () {
            this.$el.empty();
            this.model.each(function (powerUp) {
                var data = powerUp.toJSON();
                data.remaining = Math.ceil((data.duration + (data.applied - Date.now())) / 1000);
                this.$el.append(this.template(data));
            }, this);
            return this;
        }
    });

    return PowerUps;
}());