Snake.Models.Game = Backbone.Model.extend({

    defaults: {
        raw: null,
        currentPlayerName: null,
        status: 'paused',
        matrix: null
    },

    _copyToTopLevel: [
        'matrix',
        'width',
        'height',
        'status'
    ],

    initialize: function (options) {
        this.player = options.player;
        this.players = new Snake.Collections.Players();
        this.on('change:raw', this._onRawChange, this);
    },

    _onRawChange: function (model, data) {
        this.players.reset(_.map(data.players, function (player) {
            player.id = player.name;
            return player;
        }, this));
        var serverPlayer = this.players.get(this.player.get('name'));
        if (serverPlayer) {
            this.player.set(serverPlayer.toJSON());
        }
        this.set(_.pick(data, this._copyToTopLevel));
    }

});