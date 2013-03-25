Snake.Models.GameClient = (function () {

    var GameClient = Backbone.Model.extend({

        respawnTime: 3000,

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

        _socketEvents: [
            'connect:success',
            'connect:error',
            'game:tick',
            'game:over',
            'game:start:success',
            'game:pause:success',
            'game:reset:success',
            'game:start:error',
            'player:respawn:success',
            'player:join:success',
            'player:leave:success',
            'player:join:error'
        ],

        initialize: function (options) {
            this.socket = options.socket;
            this.player = options.player;
            this.players = new Snake.Collections.Players();
            this.player.on('change:direction', function (model) {
                if (this.isRunning() && model.get('alive')) {
                    this._emit('player:command', { direction: model.get('direction') });
                }
            }, this);
            this.player.on('join', function () {
                this._emit('player:join', {
                    name: this.player.get('name')
                });
            }, this);
            this.on('change:raw', this._onRawChange, this);
            this._initializeSocket();
        },

        respawn: function () {
            this.player.unset('direction', { silent: true });
            this._emit('player:respawn');
        },

        play: function () {
            this._emit('game:start');
        },

        pause: function () {
            this._emit('game:pause');
        },

        reset: function () {
            this._emit('game:reset');
        },

        isRunning: function () {
            return this.get('status') === 'playing';
        },

        _emit: function (message, data) {
            this.socket.emit(message, data);
            console.log('sent', message, data);
        },

        _onRawChange: function (model, data) {
            this.players.reset(_.map(data.players, function (player) {
                player.id = player.name;
                return player;
            }, this));
            if (this.player) {
                var serverPlayer = this.players.get(this.player.get('name'));
                if (serverPlayer) {
                    this.player.set(_.pick(serverPlayer.toJSON(), ['score', 'length', 'alive']));
                }
            }
            this.set(_.pick(data, this._copyToTopLevel));
        },

        _initializeSocket: function () {
            _.each(this._socketEvents, function (event) {
                this.socket.on(event, _.bind(function (data) {
                    if (event !== 'game:tick') {
                        console.log('received', event, data);
                    }
                    if (data.game) {
                        this.set({ raw: data.game });
                    }
                    this.trigger(event, data, this);
                }, this));
            }, this);
        }
    });

    return GameClient;
}());