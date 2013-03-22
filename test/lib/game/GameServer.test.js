describe('Game Server', function () {

    var _ = require('lodash'),
        ioClient = require('socket.io-client'),
        sinon = require('sinon'),
        GameServer = require('../../../lib/game/GameServer'),
        options = {
            transports: ['websocket'],
            'force new connection': true
        },
        server,
        gameId;

    beforeEach(function () {
        var io, gameServer;

        server      = require('http').createServer();
        io          = require('socket.io').listen(server, { log: false });
        gameServer  = new GameServer(io, '/games');
        gameId      = gameServer.createGame({
            width: 10,
            height: 10
        });
        server.listen(3000);
    });

    afterEach(function () {
        server.close();
    });

    describe('#player:join', function () {

        it('should emit a player:join:success event when a player successfully joins a game', function (done) {
            var client = ioClient.connect('http://localhost:3000/games/' + gameId, options);
            client.on('connect', function () {
                client.on('player:join:success', function () {
                    client.disconnect();
                    done();
                });
                client.emit('player:join', { name: 'boof' });
            });
        });

        it('should emit a player:join:error event with the correct message when a player does not specify a name', function (done) {
            var client = ioClient.connect('http://localhost:3000/games/' + gameId, options);
            client.on('connect', function () {
                client.on('player:join:error', function (data) {
                    client.disconnect();
                    data.message.should.eql('Player name must be defined');
                    done();
                });
                client.emit('player:join', undefined);
            });
        });

        it('should emit a player:join:error event with the correct message when a player uses a taken name', function (done) {
            var client1 = ioClient.connect('http://localhost:3000/games/' + gameId, options),
                client2;

            client1.on('connect', function () {
                client1.on('player:join:success', function () {
                    client2 = ioClient.connect('http://localhost:3000/games/' + gameId, options);
                    client2.on('connect', function () {
                        client2.on('player:join:error', function (data) {
                            client1.disconnect();
                            client2.disconnect();
                            data.message.should.eql('Player name is already in use');
                            done();
                        });
                        client2.emit('player:join', { name: 'boof' });
                    });
                });
                client1.emit('player:join', { name: 'boof' });
            });
        });
    });

    describe('#game:start', function () {

        it('should start sending tick messages to connected clients', function (done) {
            var alice = ioClient.connect('http://localhost:3000/games/' + gameId, options),
                bob = ioClient.connect('http://localhost:3000/games/' + gameId, options),
                other = ioClient.connect('http://localhost:3000/games/other', options),
                players = {
                    alice: {
                        client: alice,
                        other: 'bob'
                    },
                    bob: {
                        client: bob,
                        other: 'alice'
                    }
                };

            other.on('game:tick', function () {
                throw Error('Client not in game received tick message');
            });

            _.each(players, function (player, name) {
                player.client.on('connect', function () {
                    player.client.emit('player:join', { name: name });
                });
                player.client.on('player:join:success', function () {
                    players[name].connected = true;
                    if (players[player.other].connected) {
                        player.client.emit('game:start');
                    }
                });
                player.client.on('game:tick', function (game) {
                    game.players.length.should.eql(2);
                    game.matrix.length.should.eql(10);
                    players[name].ticked = true;
                    if (players[player.other].ticked) {
                        done();
                    }
                    player.client.disconnect();
                });
            });
        });

    });

});