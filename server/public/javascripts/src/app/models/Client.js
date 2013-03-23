Snake.Models.Client = Backbone.Model.extend({

    initialize: function (options) {
        this.socket = options.io.connect(window.location.pathname);
        this.game = options.game

        this.game.player.on('join', function (model) {
            console.log('Sending player:join name:' + model.get('name'));
            this.socket.emit('player:join', {
                name: model.get('name')
            });
        }, this);

        this.game.player.on('change:direction', function (model) {
            console.log('Sending player:command direction:' + model.get('direction'));
            this.socket.emit('player:command', {
                direction: model.get('direction')
            });
        }, this);

        this.game.on('play', function () {
            console.log('Sending game:start');
            this.socket.emit('game:start');
        }, this);

        this.game.on('pause', function () {
            console.log('Sending game:pause');
            this.socket.emit('game:pause');
        }, this);

        this.game.on('reset', function () {
            console.log('Sending game:reset');
            this.socket.emit('game:reset');
        }, this);

        this._initializeSocket();
    },

    _initializeSocket: function () {

        this.socket.on('game:tick', _.bind(function (data) {
            this.game.set({ raw: data.game });
        }, this));

        this.socket.on('game:over', _.bind(function (data) {
            this.game.set({ raw: data.game });
        }, this));

        this.socket.on('connect:success', _.bind(function (data) {
            this.game.set({ raw: data });
            this.trigger('connected', data);
        }, this));

        this.socket.on('connect:error', _.bind(function (data) {
            this.trigger('error', data);
            console.error(data.message);
        }, this));

        this.socket.on('game:start:success', _.bind(function (data) {
            this.game.set({ raw: data.game });
        }, this));

        this.socket.on('game:pause:success', _.bind(function (data) {
            this.game.set({ raw: data.game });
        }, this));

        this.socket.on('game:reset:success', _.bind(function (data) {
            this.game.set({ raw: data.game });
        }, this));

        this.socket.on('player:join:success', _.bind(function (data) {
            console.info('Player join success', data);
            this.game.set({ raw: data.game });
        }, this));

        this.socket.on('player:leave:success', _.bind(function (data) {
            console.info('Player leave success', data);
            this.game.set({ raw: data.game });
        }, this));

        this.socket.on('game:start:error', _.bind(function () {
            console.log('Game start error');
        }, this));

        this.socket.on('player:join:error', _.bind(function (data) {
            console.error('Player join error: ' + data.message);
        }, this));

    }
});
