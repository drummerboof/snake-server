Snake.Models.GameModel = Backbone.Model.extend({

    initialize: function (options) {
        this.on('change:direction', function (model, direction) {
            this.socket.emit('player:command', {
                direction: direction
            });
        });
        this.socket = options.socket;
        this._initializeSocket();
    },

    join: function (name) {
        this.set({ player: name });
        this.socket.emit('player:join', {
            name: name,
            game: this.get('id')
        });
    },

    isRunning: function () {
        return this.get('status') === 'playing';
    },

    toggleGame: function () {
        this.socket.emit(this.isRunning() ? 'game:pause' : 'game:start');
    },


    _initializeSocket: function () {
        this.socket.on('player:join:success', _.bind(function (data) {
            console.info('Player join success', data.name);
        }, this));

        this.socket.on('player:join:error', _.bind(function () {
            console.error('Player join error');
        }, this));

        this.socket.on('game:start:success', _.bind(function () {
            this.set({ status: 'playing' });
        }, this));

        this.socket.on('game:start:error', _.bind(function () {
            this.set({ status: 'paused' });
        }, this));

        this.socket.on('game:pause:success', _.bind(function () {
            this.set({ status: 'paused' });
        }, this));

        this.socket.on('game:tick', _.bind(function (game) {
            this.set({
                game: game,
                status: game.status
            });
        }, this));

    }
});