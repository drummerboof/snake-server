Snake.Models.Player = (function () {

    var Player = Backbone.Model.extend({

        defaults: {
            score: 0,
            direction: null
        },

        directions: ['north', 'south', 'east', 'west'],

        initialize: function (options) {
            this.game = options.game;
            this.keyListener = options.keyListener;
            this.game.on('change:status', this._onGameStateChange, this);
            this._initializeKeyListener();
        },

        respawn: function () {
            this.unset('direction', { silent: true });
            this.game.respawn();
        },

        _initializeKeyListener: function () {
            _.each(this.directions, function (direction) {
                this.keyListener.on('press:' + direction, this._onKeyPress, this);
            }, this);
        },

        _onKeyPress: function (alias) {
            if (this.game.isRunning()) {
                this.set({ direction: alias });
            }
        }
    });

    return Player
}());