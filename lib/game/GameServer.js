module.exports = (function GameServer() {

    var _ = require('lodash'),
        md5 = require('MD5'),
        path = require('path'),
        Game = require('./Game'),
        Player = require('./Player');

    var GameServer = function (io, rootNamespace) {
        this.rootNamespace = rootNamespace;
        this.io = io;
        this.games = {};
    };

    _.extend(GameServer.prototype, {

        createGame: function (options, id) {
            var game = new Game(options),
                id = id || md5(new Date() + Math.random());

            game.on('tick', _.bind(function(game) {
                this.io.of(this.createGameNamespace(id)).emit('game:tick', game.serialize());
            }, this));
            game.on('gameover', _.bind(function(game) {
                this.io.of(this.createGameNamespace(id)).emit('game:over', game.serialize());
            }, this));
            this.games[id] = game;
            this.io.of(this.createGameNamespace(id)).on('connection', _.bind(this._intializeSocket, this));
            return id;
        },

        createGameNamespace: function(id) {
            return path.join(this.rootNamespace, id);
        },

        getGameIdFromNamespace: function (namespace) {
            return _.find(_.keys(this.games), function (id) {
                return this.createGameNamespace(id) === namespace;
            }, this);
        },

        _intializeSocket: function (socket) {
            var socketData = { game: this.getGameIdFromNamespace(socket.namespace.name) };
            if (_.isUndefined(socketData.game)) {
                socket.emit('connect:error', {
                    message: 'Game could not be found'
                });
                return;
            }
            socket.set('data', socketData, _.bind(function () {
                socket.emit('connect:success', this.games[socketData.game].serialize());

                socket.on('player:join', _.bind(function (data) {
                    this._onSocketPlayerJoin(socket, data);
                }, this));

                socket.on('player:command', _.bind(function (data) {
                    this._onSocketPlayerCommand(socket, data);
                }, this));

                socket.on('game:start', _.bind(function () {
                    this._onSocketGameStart(socket);
                }, this));

                socket.on('game:pause', _.bind(function () {
                    this._onSocketGamePause(socket);
                }, this));

                socket.on('disconnect', _.bind(function () {
                    this._onSocketDisconnect(socket);
                }, this));
            }, this));
        },

        _onSocketPlayerJoin: function (socket, data) {
            socket.get('data', _.bind(function (error, socketData) {
                socketData.player = (data || {}).name;
                socket.set('data', socketData, _.bind(function () {
                    try {
                        this.games[socketData.game].queuePlayer(new Player(socketData.player));
                        socket.emit('player:join:success', {
                            name: socketData.player,
                            game: this.games[socketData.game].serialize()
                        });
                    } catch (e) {
                        socket.emit('player:join:error', {
                            message: e.message
                        });
                    }
                }, this));
            }, this));
        },

        _onSocketPlayerCommand: function (socket, command) {
            socket.get('data', _.bind(function (error, socketData) {
                try {
                    this.games[socketData.game].getPlayer(socketData.player).setDirection(command.direction);
                    socket.emit('player:command:success');
                } catch (e) {
                    socket.emit('player:command:error', {
                        message: 'Invalid direction'
                    });
                }
            }, this));
        },

        _onSocketGameStart: function (socket) {
            socket.get('data', _.bind(function (error, socketData) {
                this.games[socketData.game].start();
                socket.emit('game:start:success');
            }, this));
        },

        _onSocketGamePause: function (socket) {
            socket.get('data', _.bind(function (error, socketData) {
                this.games[socketData.game].pause();
                socket.emit('game:pause:success');
            }, this));
        },

        _onSocketDisconnect: function (socket) {
            socket.get('data', _.bind(function (error, socketData) {
                try {
                    this.games[socketData.game].removePlayer(socketData.name);
                    if (this.games[socketData.game].getPlayers().length === 0) {
                        delete this.games[socketData.game];
                    }
                } catch (e) {}
            }, this));
        }
    });

    return GameServer;

}());