Snake.App = Backbone.View.extend({

    el: '#app',

    views: {},

    models: {},

    directions: [
        'west',
        'north',
        'east',
        'south'
    ],

    initialize: function (options) {
        this._initializeModels(options);
        this._initializeViews(options);
    },

    _initializeModels: function (options) {
        this.models.player = new Snake.Models.Player();
        this.models.game = new Snake.Models.Game({
            player: this.models.player
        });
        this.models.client = new Snake.Models.Client(_.extend(options, {
            game: this.models.game
        }));
        this.models.game.on('change:status', function (model, status) {
            if (status === 'playing') {
                this.playerKeyListener.listen();
            } else {
                this.playerKeyListener.stop();
            }
        }, this);

        this.playerKeyListener = new Snake.Models.KeyListener({
            37: 'west',
            38: 'north',
            39: 'east',
            40: 'south'
        });
        _.each(this.playerKeyListener.getListeners(), function (event, code) {
            this.playerKeyListener.on('press:' + event, function () {
                this.models.game.player.set({ direction: event });
            }, this);
        }, this)
    },

    _initializeViews: function (options) {
        this.views.scores = new Snake.Views.Scores({
            model: this.models.game.player
        });
        this.views.controls = new Snake.Views.Controls({
            model: this.models.game
        });
        this.views.players = new Snake.Views.Players({
            model: this.models.game.players
        });
        this.views.join = new Snake.Views.Join({
            model: this.models.game.player
        });
        this.views.canvas = new Snake.Views.Canvas({
            model: this.models.game
        });
        this.views.scores.render();
        this.views.join.render();
        this.views.controls.render();
    }
});