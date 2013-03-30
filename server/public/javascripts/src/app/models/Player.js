Snake.Models.Player = (function () {

    var Player = Backbone.Model.extend({

        defaults: {
            score: 0,
            direction: null
        },

        directions: ['north', 'south', 'east', 'west'],

        initialize: function () {
            this.powerUps = new Backbone.Collection();
            this.on('change:powerUps', this._onPowerUpsChange, this);
        },

        _onPowerUpsChange: function (model, data) {
            this.powerUps.reset(data);
        }
    });

    return Player
}());