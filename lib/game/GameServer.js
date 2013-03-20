module.exports = (function GameServer() {

    var _ = require('lodash'),
        md5 = require('MD5'),
        Game = require('./Game'),
        Player = require('./Player');

    var GameServer = function (io) {
        this.io = io;
        this.games = {};
    };

    _.extend(GameServer.prototype, {

        createGame: function (options, id) {
            var game = new Game(options),
                id = id || md5(new Date() + Math.random());

            game.on('tick', _.bind(function(game) {
                this.io.sockets.in(id).emit('game:tick', game.serialize());
            }, this));
            game.on('gameover', _.bind(function(game) {
                this.io.sockets.in(id).emit('game:over', game.serialize());
                //delete this.games[id];
            }, this));

            this.games[id] = game;
            return id;
        },

        listen: function () {
            this.io.sockets.on('connection', _.bind(this._intializeSocket, this));
        },

        _intializeSocket: function (socket) {
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
        },

        _onSocketPlayerJoin: function (socket, data) {
            if (_.has(this.games, data.game)) {
                socket.set('data', data, _.bind(function () {
                    try {
                        this.games[data.game].addPlayer(new Player(data.name));
                        socket.join(data.game);
                        socket.emit('player:join:success', { name: data.name });
                    } catch (e) {
                        socket.emit('player:join:error', {
                            message: e.message
                        });
                    }
                }, this));
            } else {
                socket.emit('player:join:error', {
                    message: 'Game not found'
                });
            }
        },

        _onSocketPlayerCommand: function (socket, command) {
            socket.get('data', _.bind(function (error, data) {
                if (error || !_.has(this.games, data.game)) {
                    socket.emit('player:command:error', {
                        message: 'Player be in a game before issuing a command'
                    });
                } else {
                    try {

                        this.games[data.game].getPlayer(data.name).setDirection(command.direction);
                        socket.emit('player:command:success');
                    } catch (e) {
                        socket.emit('player:command:error', {
                            message: 'Invalid direction'
                        });
                    }
                }
            }, this));
        },

        _onSocketGameStart: function (socket) {
            socket.get('data', _.bind(function (error, data) {
                if (error || !_.has(this.games, data.game)) {
                    socket.emit('game:start:error', {
                        message: 'Player be in a game before starting the game'
                    });
                } else {
                    this.games[data.game].start();
                    socket.emit('game:start:success');
                }
            }, this));
        },

        _onSocketGamePause: function (socket) {
            socket.get('data', _.bind(function (error, data) {
                if (error || !_.has(this.games, data.game)) {
                    socket.emit('game:pause:error', {
                        message: 'Player be in a game before pausing the game'
                    });
                } else {
                    this.games[data.game].pause();
                    socket.emit('game:pause:success');
                }
            }, this));
        },

        _onSocketDisconnect: function (socket) {
            socket.get('data', _.bind(function (error, data) {
                if (!error && data && data.game) {
                    if (_.has(this.games, data.game)) {
                        try {
                            this.games[game].removePlayer(data.name);
                        } catch (e) {}
                    }
                }
            }, this));
        }
    });

    return GameServer;

}());