Snake.Models.Player = (function () {

    var Player = Backbone.Model.extend({

        defaults: {
            score: 0,
            direction: null
        },

        directions: ['north', 'south', 'east', 'west'],

        initialize: function (options) {
            this.keyListener = options.keyListener;
            this._initializeKeyListener();
        },

        _initializeKeyListener: function () {
            _.each(this.directions, function (direction) {
                this.keyListener.on('press:' + direction, this._onKeyPress, this);
            }, this);
        },

        _onKeyPress: function (alias) {
            this.set({ direction: alias });
        }
    });

    return Player
}());