describe('Game', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Game = require('../../../lib/game/Game'),
        Player = require('../../../lib/game/Player'),
        Food = require('../../../lib/game/Food'),
        Point = require('../../../lib/game/Point'),
        game;

    beforeEach(function () {
        game = new Game({
            width: 10,
            height: 10
        });
    });

    describe('#Game()', function () {

        it('should throw an exception if the width or height are less than 1', function () {
            (function () { new Game({ width: 0, height: 10}); }).should.throw('Game width or height cannot be zero');
            (function () { new Game({ width: 10, height: 0}); }).should.throw('Game width or height cannot be zero');
        });

        it('should set the settings for the game', function () {
            var game = new Game({
                speed: 200,
                foodMax: 2,
                width: 50,
                height: 60
            });
            game.getSpeed().should.eql(200);
            game.serialize().width.should.eql(50);
            game.serialize().height.should.eql(60);
            game.tick();
            game.getFood().length.should.eql(2);
        });

        it('should maintain its own scope', function () {
            var game2 = new Game({
                width: 10,
                height:20
            });
            game2.queuePlayer(new Player('boof'));
            game2.flushPlayerQueue();
            game.getPlayers().should.be.empty;
        });
    });

    describe('#serialize()', function () {

        it('should combine the settings with the state of the game and add players in the player queue', function () {
            var game = new Game({ width: 3, height: 3 }),
                player = new Player('bob');
            player.setPosition(new Point(0, 0));
            game.queuePlayer(player);
            game.serialize().should.eql({
                status: 'paused',
                players: [{
                    name: 'bob',
                    direction: null,
                    length: 5,
                    position: {
                        x: 0,
                        y: 0
                    },
                    alive: true,
                    score: 0,
                    body: [{
                        x: 0,
                        y: 0
                    }]
                }],
                obstacles: [],
                food: [],
                matrix: [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null]
                ],
                speed: 50,
                foodMax: 1,
                width: 3,
                height: 3
            });
        });
    });

    describe('#getLivingPlayers()', function () {

        it('should return an array of all players which are alive', function () {
            var player1 = new Player('alive!'),
                player2 = new Player('dead!');
            game.queuePlayer(player1);
            game.queuePlayer(player2);
            game.flushPlayerQueue();

            player2.kill()
            game.getLivingPlayers().length.should.eql(1);
            game.getLivingPlayers()[0].should.eql(player1);
        });
    });

    describe('#setSpeed()', function () {

        it('should set the tick timeout for the game', function () {
            game.setSpeed(50);
            game.getSpeed().should.eql(50);
            game.setSpeed(100);
            game.getSpeed().should.eql(100);
        });
    });

    describe('#getRandomSpawnLocation()', function () {

        it('should return the first empty cell of the game matrix using getNextEmptyCellFromPoint', function () {
            var randomPoint = new Point(2, 2),
                nextFreePoint = new Point(3, 3);
            sinon.stub(Point, 'random').returns(randomPoint);
            sinon.stub(game._state.matrix, 'getNextEmptyCellFromPoint').returns(nextFreePoint);

            var point = game.getRandomSpawnLocation();

            Point.random.callCount.should.eql(1);
            game._state.matrix.getNextEmptyCellFromPoint.calledWithExactly(randomPoint).should.be.true;
            point.should.equal(nextFreePoint);
        });
    });

    describe('#queuePlayer()', function () {

        it('should throw an error if adding a player whose name is already taken', function () {
            game.queuePlayer(new Player('bob'));
            (function () { game.queuePlayer(new Player('bob')); }).should.throw('Player name is already in use');
        });
        it('should add a new player to the player queue', function () {
            var player = new Player('test');
            game.getPlayerQueue().should.be.empty;
            game.queuePlayer(player);
            game.getPlayerQueue().length.should.eql(1);
            game.getPlayerQueue()[0].should.eql(player);
        });
    });

    describe('#getPlayer()', function () {

        it('should get the player from the list of active players by name', function () {
            var player = new Player('test');
            game._state.players.push(player);
            game.getPlayer('test').should.eql(player);
        });
    });

    describe('#removePlayer()', function () {

        it('should remove the player from the list of active players or player queue by name', function () {
            var player = new Player('test'),
                queuedPlayer = new Player('queued');
            game.queuePlayer(player);
            game.flushPlayerQueue();
            game.getPlayers().length.should.eql(1);

            game.queuePlayer(queuedPlayer);

            game.removePlayer('bob');
            game.getPlayers().length.should.eql(1);
            game.getPlayerQueue().length.should.eql(1);

            game.removePlayer('test');
            game.getPlayers().length.should.eql(0);
            game.getPlayerQueue().length.should.eql(1);

            game.removePlayer('queued');
            game.getPlayers().length.should.eql(0);
            game.getPlayerQueue().length.should.eql(0);
        });
    });

    describe('#flushPlayerQueue()', function () {

        it('should add any queued players to the game, assigning them a random position if they dont already have one', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            game.queuePlayer(player1);
            game.queuePlayer(player2);
            game.getPlayers().should.be.empty;
            game.getPlayerQueue().length.should.eql(2)

            // Flush the player queue
            game.flushPlayerQueue();
            game.getPlayers().length.should.eql(2);
            game.getPlayerQueue().should.be.empty;
        });
    });

    describe('#spawnFood()', function () {

        it('should spawn any food if required', function () {
            var game = new Game({
                    foodMax: 2
                }),
                foodPlaced = 0,
                foodPoints = [
                    new Point(1, 1),
                    new Point(2, 2)
                ];

            sinon.stub(game, 'getRandomSpawnLocation', function () {
                return foodPoints[foodPlaced++];
            });

            game.spawnFood();
            game.getFood()[0].getPosition().should.eql(foodPoints[0]);
            game.getFood()[1].getPosition().should.eql(foodPoints[1]);
            game.getRandomSpawnLocation.callCount.should.eql(2);

            // Same food still remains and was not replaced
            game.spawnFood();
            game.getFood()[0].getPosition().should.eql(foodPoints[0]);
            game.getFood()[1].getPosition().should.eql(foodPoints[1]);
            game.getRandomSpawnLocation.callCount.should.eql(2);
        });
    });

    describe('#start()', function () {

        it('should start the game loop and update the status of the game', function () {
            sinon.stub(game, 'tick');
            game.isRunning().should.be.false;
            game.start();
            game.isRunning().should.be.true;
            game.tick.callCount.should.eql(1);
        });

        it('should trigger a start event', function () {
            var startSpy = sinon.spy();
            game.on('start', startSpy);
            game.start();
            startSpy.callCount.should.eql(1);
        });

        it('should do nothing if the game is already running', function () {
            sinon.stub(game, 'tick');
            game.start();
            var startSpy = sinon.spy();
            game.tick.reset();
            game.start();
            game.tick.called.should.be.false;
            startSpy.callCount.should.eql(0);
        });
    });

    describe('#pause()', function () {

        it('should update the status of the game', function () {
            sinon.stub(game, 'tick');
            game.start();
            game.pause();
            game.isRunning().should.be.false;
        });

        it('should trigger a pause event', function () {
            var pauseSpy = sinon.spy();
            sinon.stub(game, 'tick');
            game.on('pause', pauseSpy);
            game.start();
            game.pause();
            pauseSpy.callCount.should.eql(1);
        });

        it('should do nothing if the game is already running', function () {
            var pauseSpy = sinon.spy();
            game.on('pause', pauseSpy);
            game.pause();
            pauseSpy.callCount.should.eql(0);
        });
    });

    describe('#reset()', function () {

        it('should set the status back to paused', function () {
            var clock = sinon.useFakeTimers(),
                player = new Player('test');

            player.setPosition(new Point(0, 0));
            player.setDirection('north');
            game.queuePlayer(player);
            game.start();
            game.isRunning().should.be.true;
            game.tick();
            game.isRunning().should.be.false;
            game.serialize().status.should.eql('over');
            game.reset();
            game.serialize().status.should.eql('paused');
            clock.restore();
        });

        it('should move dead players back into the player queue and reset their properties', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');
            player1.kill();
            game.queuePlayer(player1);
            game.flushPlayerQueue();
            game.queuePlayer(player2);
            game.getPlayers().length.should.eql(1);
            game.getPlayerQueue().length.should.eql(1);

            sinon.stub(game, 'isRunning').returns(false);
            sinon.stub(player1, 'reset');
            game.reset();
            game.getPlayers().should.be.empty;
            game.getPlayerQueue().length.should.eql(2);
            player1.reset.called.should.be.true;
        });

        it('should remove all food from the game', function () {
            game.spawnFood();
            game.getFood().length.should.eql(1);
            game.reset();
            game.getFood().should.be.empty;
        });

        it('should recreate an empty matrix', function () {
            sinon.stub(game, 'getRandomSpawnLocation').returns(new Point(1, 2));
            game.spawnFood();
            game.tick();
            game.serialize().matrix[1][2].should.eql('food');
            game.reset();
            (game.serialize().matrix[1][2] === null).should.be.true;
        });
    });

    describe('#tick()', function () {

        function createTestGame() {
            return new Game({
                foodMax: 2,
                width: 5,
                height: 5
            });
        }

        it('should spawn any food if required', function () {
            var game = createTestGame();
            sinon.spy(game, 'spawnFood');
            game.tick();
            game.spawnFood.called.should.be.true;
        });

        it('should move each player if they are still alive', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2'),
                player3 = new Player('test3');

            game.queuePlayer(player1);
            game.queuePlayer(player2);
            game.queuePlayer(player3);

            // Flush player queue and kill player 3
            game.tick();
            player3.kill();

            sinon.stub(player1, 'move');
            sinon.stub(player2, 'move');
            sinon.stub(player3, 'move');

            game.tick();
            player1.move.callCount.should.eql(1);
            player2.move.callCount.should.eql(1);
            player3.move.called.should.be.false;
        });

        it('should kill players who collide with themselves', function () {
            var player1 = new Player('test1');

            player1.setPosition(new Point(2, 2));
            player1.setDirection('west');
            game.queuePlayer(player1);

            // Flush player queue and move one space
            game.tick();
            game.tick();

            player1.setDirection('south');
            game.tick();

            player1.setDirection('east');
            game.tick();

            player1.isAlive().should.be.true;

            player1.setDirection('north');
            game.tick();
            player1.isAlive().should.be.false;
        });

        it('should kill players who are out of bounds', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            player1.setPosition(new Point(0, 0));
            player1.setDirection('west');
            player2.setPosition(new Point(1, 4));
            player2.setDirection('north');
            game.queuePlayer(player1);
            game.queuePlayer(player2);

            // Flush player queue
            game.tick();
            game.getPlayers().length.should.eql(2);
            player1.isAlive().should.be.true;
            player2.isAlive().should.be.true;

            game.tick();
            game.getPlayers().length.should.eql(2);
            player1.isAlive().should.be.false;
            player2.isAlive().should.be.true;
        });

        it('should kill the colliding player when two players collide in a head to body collision', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            player1.setPosition(new Point(0, 0));
            player1.setDirection('east');
            player2.setPosition(new Point(0, 2));
            player2.setDirection('north');
            game.queuePlayer(player1);
            game.queuePlayer(player2);
            // Flush the player queue
            game.tick();
            game.getPlayers().length.should.eql(2);

            // Move twice so player2 head collides with player1 body
            game.tick();
            game.getPlayers().length.should.eql(2);

            game.tick();
            game.getPlayers().length.should.eql(2);
            player1.isAlive().should.be.true;
            player2.isAlive().should.be.false;
        });

        it('should remove the both players when two players collide in a head to head collision', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            player1.setPosition(new Point(1, 0));
            player1.setDirection('west');
            player2.setPosition(new Point(0, 1));
            player2.setDirection('north');
            game.queuePlayer(player1);
            game.queuePlayer(player2);
            // Flush the player queue
            game.tick();
            game.getPlayers().length.should.eql(2);

            // Move once so player2 and player1 have a head to head collision
            game.tick();
            game.getPlayers().length.should.eql(2);
            player1.isAlive().should.be.false;
            player2.isAlive().should.be.false;
        });

        it('should feed living players who collide with food and remove food from the game', function () {
            var game = new Game({
                    foodMax: 2,
                    width: 5,
                    height: 5
                }),
                foodPlaced = 0,
                player1 = new Player('test1', 4),
                player2 = new Player('test2', 4);

            sinon.stub(game, 'getRandomSpawnLocation', function () {
                return new Point(3, foodPlaced++);
            });
            sinon.stub(player2, 'isAlive').returns(false);
            player1.setPosition(new Point(1, 0));
            player1.setDirection('east');
            player2.setPosition(new Point(1, 1));
            player2.setDirection('east');
            game.queuePlayer(player1);

            // Flush the player queue
            game.tick();

            // Move the game along one tick
            game.tick();
            game.getFood().length.should.eql(2);

            // Move the game along another tick so the players collides with food
            game.tick();
            player1.getLength().should.eql(5);
            player2.getLength().should.eql(4);
            game.getFood().length.should.eql(1);
        });

        it('should flush the player queue', function () {
            sinon.spy(game, 'flushPlayerQueue');
            game.tick();
            game.flushPlayerQueue.called.should.be.true;
        });

        it('should update the game matrix with renderable display objects', function () {
            var game = new Game({
                    foodMax: 1,
                    width: 5,
                    height: 5
                }),
                provider = [
                    {
                        fixture: {
                            player1direction: 'east',
                            player2direction: 'north'
                        },
                        expected: [
                            [null, null, null, null, null],
                            ['player:p1', null, null, null, null],
                            [null, null, null, null, null],
                            [null, null, 'food', null, null],
                            [null, null, null, null, 'player:p2']
                        ]
                    },
                    {
                        fixture: {
                            player1direction: 'east',
                            player2direction: 'north'
                        },
                        expected: [
                            [null, null, null, null, null],
                            ['player:p1', null, null, null, null],
                            ['player:p1', null, null, null, null],
                            [null, null, 'food', null, null],
                            [null, null, null, 'player:p2', 'player:p2']
                        ]
                    },
                    {
                        fixture: {
                            player1direction: 'east',
                            player2direction: 'north'
                        },
                        expected: [
                            [null, null, null, null, null],
                            ['player:p1', null, null, null, null],
                            ['player:p1', null, null, null, null],
                            ['player:p1', null, 'food', null, null],
                            [null, null, 'player:p2', 'player:p2', 'player:p2']
                        ]
                    },
                    {
                        fixture: {
                            player1direction: 'north',
                            player2direction: 'west'
                        },
                        expected: [
                            [null, null, null, null, null],
                            [null, null, null, null, null],
                            [null, null, null, null, null],
                            [null, null, 'player:p2', null, null],
                            [null, null, 'player:p2', 'player:p2', 'player:p2']
                        ]
                    },
                    {
                        fixture: {
                            player1direction: 'north',
                            player2direction: 'west'
                        },
                        expected: [
                            [null, null, null, null, null],
                            [null, null, null, null, null],
                            [null, null, 'player:p2', null, null],
                            [null, null, 'player:p2', null, null],
                            [null, null, 'player:p2', 'player:p2', 'player:p2']
                        ]
                    }
                ],
                player1 = new Player('p1'),
                player2 = new Player('p2'),
                player3 = new Player('p3');

            sinon.stub(game, 'getRandomSpawnLocation').returns(new Point(3, 2));
            sinon.stub(player3, 'isAlive').returns(false);
            sinon.stub(player3, 'shouldRender').returns(false);
            player1.setPosition(new Point(1, 0));
            player2.setPosition(new Point(4, 4));
            player3.setPosition(new Point(2, 2));
            game.queuePlayer(player1);
            game.queuePlayer(player2);
            game.queuePlayer(player3);

            _.each(provider, function (data) {
                player1.setDirection(data.fixture.player1direction);
                player2.setDirection(data.fixture.player2direction);
                game.tick();
                game.serialize().matrix.should.eql(data.expected);
            }, this);
        })

        it('should trigger a tick event', function () {
            var tickSpy = sinon.spy();
            game.on('tick', tickSpy);
            game.tick();
            tickSpy.callCount.should.eql(1);
        });

        it('should set the game status to over and trigger a gameover event if all the players are dead', function () {
            var clock = sinon.useFakeTimers(),
                player1 = new Player('test1'),
                gameOverSpy = sinon.spy();

            game.on('gameover', gameOverSpy);
            game.on('gameover', function (game) {
                if (game.isRunning()) {
                    throw new Error('Game should not be running');
                }
            });
            player1.setPosition(new Point(1, 0));
            player1.setDirection('west');
            game.queuePlayer(player1);

            // Flush player queue
            game.start();
            gameOverSpy.called.should.be.false;
            game.isRunning().should.be.true;
            // One tick moves player to edge of board
            game.tick();
            gameOverSpy.called.should.be.false;
            game.isRunning().should.be.true;
            // Second tick moves player out of bounds
            game.tick();
            gameOverSpy.callCount.should.eql(1);
            game.isRunning().should.be.false;
            game.serialize().status.should.eql('over');

            clock.restore();
        });

        it('should schedule the next tick event using setTimeout if the game is still running', function () {
            var clock = sinon.useFakeTimers(),
                player1 = new Player('test1');

            player1.setPosition(new Point(1, 0));
            player1.setDirection('west');
            game.queuePlayer(player1);
            // Call tick and set game to running
            game.start();

            sinon.spy(game, 'tick');
            clock.tick(game.getSpeed());
            game.tick.callCount.should.eql(1);

            clock.restore();
        });
    });

});