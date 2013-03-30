Snake.Views.PowerUps = (function () {

    var PowerUps = Backbone.View.extend({

        el: '#powerups',

        events: {

        },

        initialize: function (options) {
            this.template = _.template($('#template-powerup').html());
            this.model.on('change', this.render, this);
        },

        render: function () {
            if (_.isArray(this.model.get('powerUps'))) {
                this.$el.empty();
                _.each(this.model.get('powerUps'), function (powerUp) {
                    this.$el.append(this.template(_.extend({}, powerUp, {
                        remaining: Math.ceil((powerUp.duration + (powerUp.applied - Date.now())) / 1000)
                    })));
                }, this);
            }
            return this;
        }
    });

    return PowerUps;
}());