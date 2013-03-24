Snake.Models.ManualPlayer = (function () {

    var ManualPlayer = Backbone.Model.extend({

        defaults: {
            score: 0,
            direction: null
        },

        initialize: function (options) {
            this.game = options.game;
            this.keyListener = options.keyListener;
            this.game.on('change:status', this._onGameStateChange, this);
            this.keyListener.on('press', this._onKeyPress, this);
        },

        respawn: function () {
            this.unset('direction', { silent: true });
            this.game.respawn();
        },

        _onGameStateChange: function (game, state) {
            if (state === 'playing') {
                this.keyListener.listen();
            } else {
                this.keyListener.stop();
            }
        },

        _onKeyPress: function (alias, event, listener) {
            this.set({ direction: alias });
        }
    });

    return ManualPlayer
}());