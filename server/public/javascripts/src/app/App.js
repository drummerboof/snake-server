Snake.App = (function () {

    var App = Backbone.View.extend({

        el: '#app',

        views: {},

        models: {},

        _directionKeys: {
            37: 'west',
            38: 'north',
            39: 'east',
            40: 'south'
        },

        initialize: function (options) {
            this._initializeModels(options);
            this._initializeViews(options);
            this._initializeGlobalEvents();
            Snake.App.trigger('message:show', 'Loading game...');
        },

        render: function () {
            this.views.messages.clear();
            this.views.scores.render();
            this.views.controls.render();
        },

        error: function () {
            Snake.App.trigger('error:show', 'Game could not be found');
        },

        _initializeModels: function (options) {
            this.playerKeyListener = new Snake.Models.KeyListener(this._directionKeys);
            this.models.game = new Snake.Models.GameClient({
                socket: options.io.connect(window.location.pathname)
            });
            this.models.player = new Snake.Models.ManualPlayer({
                game: this.models.game,
                keyListener: this.playerKeyListener
            });
            this.models.game.on('connect:success', this.render, this);
            this.models.game.on('connect:error', this.error, this);
            this.models.player.on('change:alive', this._onPlayerDeadOrAlive, this);
            this.models.player.on('join', this._onPlayerJoin, this);
        },

        _initializeViews: function (options) {
            this.views.messages = new Snake.Views.Messages();
            this.views.scores = new Snake.Views.Scores({
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

        _initializeGlobalEvents: function () {
            App.on('message:flash', function (message, duration) {
                this.views.messages.flash(message, duration);
            }, this);
            App.on('error:flash', function (error, duration) {
                this.views.messages.flash(error, duration, Snake.Views.Messages.ERROR);
            }, this);
            App.on('message:show', function (message) {
                this.views.messages.render(message);
            }, this);
            App.on('error:show', function (error) {
                this.views.messages.render(error, Snake.Views.Messages.ERROR);
            }, this);
            App.on('messages:clear', function (error, duration) {
                this.views.messages.clear();
            }, this);
        },

        _onPlayerJoin: function (player) {
            this.models.game.join(player);
        },

        _onPlayerDeadOrAlive: function (model, alive) {
            if (!alive) {
                var message = 'You died! Respawning in ' + (this.models.game.respawnTime / 1000) + ' seconds...';
                Snake.App.trigger('message:flash', message, this.models.game.respawnTime);
                setTimeout(_.bind(function () {
                    this.models.player.respawn();
                }, this), this.models.game.respawnTime);
            }
        }
    }, Backbone.Events);

    return App;
}());