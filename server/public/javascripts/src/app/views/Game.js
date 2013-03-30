Snake.Views.Game = (function () {

    var Game = Backbone.View.extend({

        el: '#app',

        views: {},

        models: {},

        keyListener: null,

        initialize: function (options) {
            Snake.App.trigger('message:show', 'Loading game...');
            this.keyListener = options.keyListener;
            this._initializeModels(options);
            this._initializeViews();
            this._initializeKeys();
        },

        _initializeViews: function () {
            this.views.scores = new Snake.Views.Scores({
                model: this.models.player
            });

            this.views.powerUps = new Snake.Views.PowerUps({
                model: this.models.player
            });

            this.views.controls = new Snake.Views.Controls({
                model: this.models.game,
                player: this.models.player
            });

            this.views.players = new Snake.Views.Players({
                model: this.models.game.players
            });

            this.views.canvas = new Snake.Views.Canvas({
                model: this.models.game
            });
        },

        _initializeModels: function (options) {
            this.models.player = new Snake.Models.Player();
            this.models.player.on('change:alive', this._onPlayerDeadOrAlive, this);

            this.models.game = new Snake.Models.GameClient({
                socket: options.io.connect(window.location.pathname),
                player: this.models.player
            });
            this.models.game.on('connect:success', this.render, this);
            this.models.game.on('connect:error', this.error, this);
            this.models.game.on('game:start:success', function () {
                Snake.App.trigger('messages:clear');
            }, this);
            this.models.game.on('player:join:success', function () {
                this.keyListener.listen();
            }, this);
        },

        _initializeKeys: function () {
            _.each(this.models.player.directions, function (direction) {
                this.keyListener.on('press:' + direction, function (direction) {
                    if (this.models.game.isRunning() && this.models.player.get('alive')) {
                        this.models.player.set({ direction: direction });
                    }
                }, this);
            }, this);
        },

        render: function () {
            this.keyListener.stop();
            this.views.scores.render();
            this.views.controls.render();
            Snake.App.trigger('messages:clear');
        },

        error: function () {
            Snake.App.trigger('error:show', 'Game could not be found');
        },

        _onPlayerDeadOrAlive: function (model, alive) {
            if (!alive) {
                var message = 'You died! Respawning in ' + (this.models.game.respawnTime / 1000) + ' seconds...';
                Snake.App.trigger('message:flash', message, this.models.game.respawnTime);
                setTimeout(_.bind(function () {
                    this.models.game.respawn();
                }, this), this.models.game.respawnTime);
            }
        }
    });

    return Game;
}());
