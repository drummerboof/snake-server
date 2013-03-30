Snake.Models.Player = (function () {

    var Player = Backbone.Model.extend({

        defaults: {
            score: 0,
            direction: null
        },

        directions: ['north', 'south', 'east', 'west'],

        initialize: function () {
            this.powerUps = new Backbone.Collection();
            this.on('change', this._onPowerUpsChange, this);
        },

        _onPowerUpsChange: function (model, data) {
            _.each(this.get('powerUps'), function (powerUp) {
                console.log(powerUp.applied);
            });
            this.powerUps.reset(this.get('powerUps'));
        }
    });

    return Player
}());