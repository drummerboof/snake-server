describe('Game', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Game = require('../../src/game/Game'),
        Player = require('../../src/game/Player'),
        Food = require('../../src/game/Food'),
        Point = require('../../src/game/Point'),
        InvinciblePowerUp = require('../../src/game/powerup/Invincible'),
        FoodPointMultiplierPowerUp = require('../../src/game/powerup/FoodPointMultiplier'),
        game;

    beforeEach(function () {
        game = new Game({
            powerUpChance: 1,
            playerSpeed: 1,
            speed: 1000,
            width: 10,
            height: 10
        });
    });

    describe('#Game()', function () {

        it('should throw an exception if the width or height are less than 1', function () {
            (function () { new Game({ width: 0, height: 10}); }).should.throw('Game width or height cannot be zero');
            (function () { new Game({ width: 10, height: 0}); }).should.throw('Game width or height cannot be zero');
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
            var game = new Game({ width: 3, height: 3, powerUpChance: 1 }),
                player = new Player('bob');
            player.setPosition(new Point(0, 0));
            game.queuePlayer(player);
            game.serialize().should.eql({
                status: 'paused',
                players: [{
                    name: 'bob',
                    id: 'player',
                    direction: null,
                    pendingMove: false,
                    length: 5,
                    speed: 0.5,
                    position: {
                        x: 0,
                        y: 0
                    },
                    alive: true,
                    score: 0,
                    powerUps: [],
                    points: [{
                        x: 0,
                        y: 0
                    }],
                    body: [{
                        x: 0,
                        y: 0
                    }]
                }],
                obstacles: [],
                powerUps: [],
                food: [],
                speed: 50,
                foodMax: 1,
                powerUpMax: 2,
                powerUpChance: 1,
                playerDirectionQueueLimit: 2,
                playerSpeed: 0.5,
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
            sinon.stub(game.getMatrix(), 'getNextEmptyCellFromPoint').returns(nextFreePoint);

            var point = game.getRandomSpawnLocation();

            Point.random.callCount.should.eql(1);
            game.getMatrix().getNextEmptyCellFromPoint.calledWithExactly(randomPoint).should.be.true;
            point.should.equal(nextFreePoint);
        });
    });

    describe('#respawnPlayer()', function () {

        it('should throw an exception if the player is alive or not present', function () {
            var player = new Player('test');
            player.setPosition(new Point(0, 0));
            player.setDirection('east');
            game.queuePlayer(player);
            game.flushPlayerQueue();
            (function () { game.respawnPlayer(player.getName()); }).should.throw('Player must exist and be dead to be respawned');
        });

        it('should revive a player and set a new random location and position', function () {
            var player = new Player('test'),
                newPosition = new Point(2, 2);
            sinon.stub(game.getMatrix(), 'getPointQuadrant').returns('southeast');
            player.setPosition(new Point(0, 0));
            player.setDirection('east');
            game.queuePlayer(player);
            game.flushPlayerQueue();
            sinon.stub(game, 'getRandomSpawnLocation').returns(newPosition);
            sinon.spy(player, 'setDirection');
            sinon.spy(player, 'reset');
            player.kill();
            game.respawnPlayer(player.getName());
            player.getPosition().should.eql(newPosition);
            player.setDirection.calledWithExactly('west').should.be.true;
            player.reset.callCount.should.eql(1);
        });

    });

    describe('#queuePlayer()', function () {

        it('should throw an error if adding a player whose name is already taken', function () {
            game.queuePlayer(new Player('bob'));
            (function () { game.queuePlayer(new Player('bob')); }).should.throw('Player name is already in use');
        });
        it('should add a new player to the player queue and set the speed of the player', function () {
            var player = new Player('test');
            sinon.spy(player, 'setSpeed');

            game.getPlayerQueue().should.be.empty;
            game.queuePlayer(player);
            game.getPlayerQueue().length.should.eql(1);
            game.getPlayerQueue()[0].should.eql(player);
            player.setSpeed.calledWithExactly(game.serialize().playerSpeed).should.be.true;
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

    describe('#queuePlayerDirection()', function () {

        it('should throw an exception if the player cannot be found', function () {
            (function () { game.queuePlayerDirection('test', 'east'); }).should.throw('Player cannot be found');
        });

        it('should queue up player directions up to the limit', function () {
            var player = new Player('test');

            player.setDirection('east');
            player.setPosition(new Point(2, 2));

            game.queuePlayer(player);
            game.flushPlayerQueue();

            game.queuePlayerDirection('test', 'south');
            game.queuePlayerDirection('test', 'west');
            game.queuePlayerDirection('test', 'south');
            game.queuePlayerDirection('test', 'east');

            player.getDirection().should.eql('east');

            // Initial tick to move player one position in initial direction
            game.tick();

            game.tick();
            player.getDirection().should.eql('south');

            game.tick();
            player.getDirection().should.eql('west');

            game.tick();
            player.getDirection().should.eql('west');
        });
    });

    describe('#flushPlayerQueue()', function () {

        it('should add any queued players to the game, assigning them a random position if they dont already have one', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            player1.setPosition(new Point(0, 0));

            sinon.spy(player1, 'setPosition');
            sinon.spy(player2, 'setPosition');

            game.queuePlayer(player1);
            game.queuePlayer(player2);
            game.getPlayers().should.be.empty;
            game.getPlayerQueue().length.should.eql(2)

            // Flush the player queue
            game.flushPlayerQueue();
            game.getPlayers().length.should.eql(2);
            game.getPlayerQueue().should.be.empty;

            player1.setPosition.callCount.should.eql(0);
            player2.setPosition.callCount.should.eql(1);
        });

        it('it should set their direction based on which quadrant of the game they spawned in', function () {
            var matrixQuadrantStub = sinon.stub(game.getMatrix(), 'getPointQuadrant'),
                provider = [{
                    quadrant: 'northeast',
                    expected: 'south'
                }, {
                    quadrant: 'northwest',
                    expected: 'east'
                }, {
                    quadrant: 'southeast',
                    expected: 'west'
                }, {
                    quadrant: 'southwest',
                    expected: 'north'
                }];

            _.each(provider, function (data) {
                var player = new Player(data.quadrant);
                player.setPosition(new Point(0, 0));

                sinon.stub(player, 'setDirection');
                matrixQuadrantStub.returns(data.quadrant);

                game.queuePlayer(player);
                game.flushPlayerQueue();

                player.setDirection.calledWithExactly(data.expected).should.be.true;
                player.setDirection.restore();
            }, this);
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

    describe('#spawnPowerUp()', function () {

        it('should spawn a power up based on the powerUpChance and powerUpMax settings', function () {
            var game = new Game({
                    powerUpMax: 2,
                    powerUpChance: 0.5
                }),
                powerUps = [
                    InvinciblePowerUp,
                    FoodPointMultiplierPowerUp
                ],
                powerUpPlaced = 0,
                powerUpPoints = [
                    new Point(1, 1),
                    new Point(2, 2)
                ],
                randomNumersReturned = 0,
                randomNumbers =[
                    0.2,
                    0.7,
                    0.49,
                    0.1
                ];

            sinon.stub(game, 'getRandomSpawnLocation', function () {
                return powerUpPoints[powerUpPlaced++];
            });

            sinon.stub(game, 'getRandomPowerUpConstructor', function () {
                return powerUps[powerUpPlaced];
            });

            sinon.stub(Math, 'random', function () {
                return randomNumbers[randomNumersReturned++];
            });

            game.getPowerUps().should.be.empty;

            // Under chance so powerUp spawned
            game.spawnPowerUp();
            game.getPowerUps().length.should.eql(1);

            // Over chance so no spawn
            game.spawnPowerUp();
            game.getPowerUps().length.should.eql(1);

            // Under chance so spawn
            game.spawnPowerUp();
            game.getPowerUps().length.should.eql(2);

            // Max reached so no spawn
            game.spawnPowerUp();
            game.getPowerUps().length.should.eql(2);

            game.getPowerUps()[0].should.be.an.instanceof(InvinciblePowerUp);
            game.getPowerUps()[1].should.be.an.instanceof(FoodPointMultiplierPowerUp);

            Math.random.restore();
        });
    });

    describe('#getRandomPowerUpConstructor()', function () {

        it('should return a random powerUp constructor', function () {
            var called = 0;
            sinon.stub(_, 'shuffle', function () {
                var powerUps = [
                    InvinciblePowerUp,
                    FoodPointMultiplierPowerUp
                ];
                if (called) {
                    powerUps.reverse();
                }
                called++;
                return powerUps;
            });
            game.getRandomPowerUpConstructor().should.eql(InvinciblePowerUp);
            game.getRandomPowerUpConstructor().should.eql(FoodPointMultiplierPowerUp);

            _.shuffle.restore();
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

        it('should resume all player powerUp mangers', function () {
            var player = new Player('test');
            sinon.spy(player.getPowerUpManager(), 'resume');
            game.queuePlayer(player);
            game.flushPlayerQueue();
            game.start();
            player.getPowerUpManager().resume.calledOnce.should.be.true;
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

        it('should pause all player powerUp mangers', function () {
            var player = new Player('test');
            sinon.spy(player.getPowerUpManager(), 'pause');
            game.queuePlayer(player);
            game.flushPlayerQueue();
            game.start();
            game.pause();
            player.getPowerUpManager().pause.calledOnce.should.be.true;
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

        it('should remove all powerUps from the game', function () {
            game.spawnPowerUp();
            game.getPowerUps().length.should.eql(1);
            game.reset();
            game.getPowerUps().should.be.empty;
        });

        it('should recreate an empty matrix', function () {
            sinon.stub(game, 'getRandomSpawnLocation').returns(new Point(1, 2));
            game.spawnFood();
            game.tick();
            game.getMatrix().get(1, 2).should.eql('food');
            game.reset();
            (game.getMatrix().get(1, 2) === null).should.be.true;
        });
    });

    describe('#tick()', function () {

        function createTestGame() {
            return new Game({
                speed: 1000,
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

        it('should remove expired powerUps from each player', function () {
            var player = new Player('test');

            sinon.spy(player.getPowerUpManager(), 'purgeExpired');
            player.setPosition(new Point(2, 2));
            player.setDirection('west');

            game.queuePlayer(player);
            game.flushPlayerQueue();
            player.getPowerUpManager().purgeExpired.called.should.be.false;

            game.tick();
            player.getPowerUpManager().purgeExpired.called.should.be.true;
        });

        it('should kill players who collide with themselves', function () {
            var player1 = new Player('test1');

            player1.setPosition(new Point(2, 2));
            player1.setDirection('west');
            game.queuePlayer(player1);

            // Flush player queue and move one space
            game.flushPlayerQueue();
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

        it('should feed living players who collide with food, remove food from the game and (maybe) spawn a powerUp', function () {
            var game = new Game({
                    foodMax: 2,
                    playerSpeed: 1,
                    width: 5,
                    height: 5
                }),
                foodPlaced = 0,
                player1 = new Player('test1', { length: 4 }),
                player2 = new Player('test2', { length: 4 });

            sinon.stub(game, 'spawnPowerUp');
            sinon.stub(game, 'getRandomSpawnLocation', function () {
                return new Point(3, foodPlaced++);
            });
            sinon.stub(player2, 'isAlive').returns(false);

            player1.setPosition(new Point(1, 0));
            player1.setDirection('east');

            player2.setPosition(new Point(1, 1));
            player2.setDirection('east');

            game.queuePlayer(player1);
            game.queuePlayer(player2);

            // Flush the player queue
            game.flushPlayerQueue();

            // Move the game along one tick
            game.tick();

            player1.getLength().should.eql(4);
            player2.getLength().should.eql(4);
            game.getFood().length.should.eql(2);
            game.spawnPowerUp.called.should.be.false;

            // Move the game along another tick so the players collides with food
            game.tick();
            player1.getLength().should.eql(5);
            player2.getLength().should.eql(4);
            game.getFood().length.should.eql(1);
            game.spawnPowerUp.called.should.be.true;
        });

        it('should apply powerUps to living players who collide with them and remove the powerUps from the game', function () {
            var game = new Game({
                    powerUpMax: 2,
                    powerUpChance: 1,
                    playerSpeed: 1,
                    foodMax: 2,
                    width: 5,
                    height: 5
                }),
                powerUpsPlaced = 0,
                player1 = new Player('test1'),
                player2 = new Player('test2');

            sinon.stub(game, 'spawnFood');
            sinon.stub(game, 'getRandomSpawnLocation', function () {
                return new Point(3, powerUpsPlaced++);
            });
            sinon.stub(player2, 'isAlive').returns(false);
            player1.setPosition(new Point(1, 0));
            player1.setDirection('east');
            player2.setPosition(new Point(1, 1));
            player2.setDirection('east');
            game.queuePlayer(player1);
            game.queuePlayer(player2);
            game.spawnPowerUp();
            game.spawnPowerUp();

            // Flush the player queue
            game.flushPlayerQueue();

            // Move the game along one tick
            game.tick();
            game.getPowerUps().length.should.eql(2);

            // Move the game along another tick so the players collides with food
            game.tick();

            player1.getPowerUpManager().getPowerUps().length.should.eql(1);
            player2.getPowerUpManager().getPowerUps().length.should.eql(0);
            game.getPowerUps().length.should.eql(1);
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
                    height: 5,
                    playerSpeed: 1,
                    powerUpMax: 1,
                    powerUpChance: 1
                }),
                provider = [
                    {
                        fixture: {
                            player1direction: 'east',
                            player2direction: 'north'
                        },
                        expected: [
                            [null, null, null, null, null],
                            ['player:head#p1', null, null, null, null],
                            [null, null, null, null, null],
                            [null, null, 'food', null, null],
                            [null, null, null, null, 'player:head#p2']
                        ]
                    },
                    {
                        fixture: {
                            player1direction: 'east',
                            player2direction: 'north'
                        },
                        expected: [
                            [null, null, null, null, null],
                            ['player#p1', null, null, null, null],
                            ['player:head#p1', null, null, null, null],
                            [null, null, 'food', null, null],
                            [null, null, null, 'player:head#p2', 'player#p2']
                        ]
                    },
                    {
                        fixture: {
                            player1direction: 'east',
                            player2direction: 'north'
                        },
                        expected: [
                            [null, null, null, null, null],
                            ['player#p1', null, null, null, null],
                            ['player#p1', null, null, null, null],
                            ['player:head#p1', null, 'food', null, null],
                            [null, null, 'player:head#p2', 'player#p2', 'player#p2']
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
                            ['powerup:invincible', null, null, null, null],
                            [null, null, 'player:head#p2', null, null],
                            [null, null, 'player#p2', 'player#p2', 'player#p2']
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
                            ['powerup:invincible', null, 'player:head#p2', null, null],
                            ['food', null, 'player#p2', null, null],
                            [null, null, 'player#p2', 'player#p2', 'player#p2']
                        ]
                    }
                ],
                player1 = new Player('p1'),
                player2 = new Player('p2'),
                player3 = new Player('p3'),
                randomPointsGiven = 0;

            sinon.stub(game, 'getRandomSpawnLocation', function () {
                var point = new Point(3, 2);
                randomPointsGiven++;
                if (randomPointsGiven > 1) {
                    point = new Point(randomPointsGiven, 0);
                }
                return point;
            });
            sinon.stub(game, 'getRandomPowerUpConstructor').returns(InvinciblePowerUp);
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
                game.getMatrix().serialize().should.eql(data.expected);
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