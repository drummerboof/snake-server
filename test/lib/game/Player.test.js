describe('Player', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Player = require('../../../lib/game/Player'),
        Point = require('../../../lib/game/Point'),
        Food = require('../../../lib/game/Food'),
        AbstractPowerUp = require('../../../lib/game/powerup/AbstractPowerUp'),
        PowerUpManager = require('../../../lib/game/powerup/Manager'),
        player;

    var PowerUp = AbstractPowerUp.extend({
            _identifier: 'test'
        }),

        createPowerUp = function createPowerUp (modifier, fn) {
            var methods = {};
            methods[modifier] = fn;
            return new (PowerUp.extend(methods))();
        };

    beforeEach(function () {
        player = new Player('test', { speed: 1 });
    });

    describe('#Player()', function () {

        it('should throw an exception if given a valid name in the constructor', function () {
            (function () { new Player(); }).should.throw('Player name must be defined');
            (function () { new Player(4); }).should.throw('Player name must be defined');
            (function () { new Player(''); }).should.throw('Player name must be defined');
        });

        it('should set the length and speed of the player if provided in the constructor options', function () {
            var longFastPlayer = new Player('bob', { length: 10, speed: 2 });
            player.getLength().should.eql(5);
            longFastPlayer.getLength().should.eql(10);
            longFastPlayer.getSpeed().should.eql(2);
        });

        it('should initialize a body with one segment at 0, 0 local co-ordinates', function () {
            player.getBodyRelativeToHead().should.eql([new Point(0, 0)]);
        });
    });

    describe('#reset()', function () {

        it('should reset the player state to default', function () {
            player.setDirection('north');
            player.setPosition(new Point(5, 0));
            player.setSpeed(0.5);
            player.eat(new Food(5, 5));
            player.consume(new PowerUp());
            player.move();
            player.kill();
            sinon.spy(player.getPowerUpManager(), 'clear');
            player.reset();
            player.getPowerUpManager().clear.calledOnce.should.be.true;
            player.serialize().should.eql({
                name: 'test',
                id: 'player',
                direction: null,
                pendingMove: false,
                length: 5,
                speed: 1,
                alive: true,
                position: null,
                score: 0,
                powerUps: [],
                points: [],
                body: [{
                    x: 0,
                    y: 0
                }]
            });
        });
    });

    describe('#serialize()', function () {

        it('should return the correct value', function () {
            var clock = sinon.useFakeTimers();
            player.setDirection('east');
            player.setPosition(new Point(0, 0));
            player.consume(new PowerUp());
            player.serialize().should.eql({
                name: 'test',
                id: 'player',
                direction: 'east',
                pendingMove: true,
                length: 5,
                speed: 1,
                position: {
                    x: 0,
                    y: 0
                },
                alive: true,
                score: 0,
                powerUps: [{
                    id: 'test',
                    position: null,
                    points: [],
                    duration: 0,
                    applied: 0
                }],
                points: [{
                    x: 0,
                    y: 0
                }],
                body: [{
                    x: 0,
                    y: 0
                }]
            });
            clock.restore();
        });
    });

    describe('#getPowerUpManager()', function () {

        it('should return the PowerUpManager instance for the player', function () {
            player.getPowerUpManager().should.be.an.instanceof(PowerUpManager);
        })
    });

    describe('#getCollisionPointId()', function () {

        it('should return the correct identifier for the player', function () {
            var AnotherPowerUp = AbstractPowerUp.extend({
                _identifier: 'different'
            });
            player.getCollisionPointId(1).should.eql('player#test');
            player.getCollisionPointId(0).should.eql('player:head#test');

            player.consume(new PowerUp());
            player.consume(new AnotherPowerUp());
            player.getCollisionPointId(1).should.eql('player:test:different#test');
            player.getCollisionPointId(0).should.eql('player:head:test:different#test');
        });
    });

    describe('#kill()', function () {

        it('should set the players alive flag to false and remove all powerUps', function () {
            player.consume(new PowerUp());
            player.isAlive().should.be.true;
            player.serialize().powerUps.length.should.eql(1);
            player.kill();
            player.isAlive().should.be.false;
            player.serialize().powerUps.length.should.eql(0);
        });
    });

    describe('#revive()', function () {

        it('should set the players alive flag to true', function () {
            player.kill();
            player.isAlive().should.be.false;
            player.revive();
            player.isAlive().should.be.true;
        });
    });

    describe('#shouldRender()', function () {

        it('should return the value of isAlive()', function () {
            var isAlive = sinon.stub(player, 'isAlive');
            isAlive.returns(true);
            player.shouldRender().should.eql(true);
            isAlive.returns(false);
            player.shouldRender().should.eql(false);
        });
    });

    describe('#setSpeed()', function () {
        it('should set the speed and cap it between 1 and 0', function () {
            player.setSpeed(0.8);
            player.getSpeed().should.eql(0.8);
            player.setSpeed(1.2);
            player.getSpeed().should.eql(1);
            player.setSpeed(-1);
            player.getSpeed().should.eql(0);
            player.setSpeed(0);
            player.getSpeed().should.eql(0);
            player.setSpeed(1);
            player.getSpeed().should.eql(1);
        });
    });

    describe('#setDirection()', function () {

        it('should throw an exception if given an invalid value', function () {
            (function () { player.setDirection('bad'); }).should.throw('Invalid direction');
        });

        it('should not allow north -> south, south -> north or east -> west, west -> east changes', function () {
            var provider = [{
                fixture: ['north', 'south'],
                expected: 'north'
            }, {
                fixture: ['south', 'north'],
                expected: 'south'
            }, {
                fixture: ['east', 'west'],
                expected: 'east'
            }, {
                fixture: ['west', 'east'],
                expected: 'west'
            }];
            _.each(provider, function (data) {
                var player = new Player('test');
                player.setDirection(data.fixture[0]);
                player.setDirection(data.fixture[1]);
                player.getDirection().should.eql(data.expected);
            }, this);
        });

        it('should set the direction when given a valid value and set the pendingMove flag to true', function () {
            player.isPendingMove().should.be.false;
            _.each(['north', 'east', 'south', 'west'], function (direction) {
                player.setDirection(direction);
                player.getDirection().should.eql(direction);
                player.isPendingMove().should.be.true;
            });
        });
    });

    describe('#setRandomDirection()', function () {

        it('should give the player a random direction', function () {
            sinon.spy(player, 'setDirection');
            player.setRandomDirection();
            _.values(Player.DIRECTIONS).should.include(player.getDirection());
            player.setDirection.restore();
        });
    });

    describe('#getBodyRelativeToHead()', function () {

        it('should return all of the body segments including the head relative to the head (0, 0)', function () {
            player._state.body = [
                new Point(0, 0),
                new Point(-1, 0),
                new Point(-2, 0),
                new Point(-3, 0)
            ];
            player.getBodyRelativeToHead().should.eql([
                new Point(0, 0),
                new Point(-1, 0),
                new Point(-2, 0),
                new Point(-3, 0)
            ]);
        });
    });

    describe('#getBodyRelativeToPosition()', function () {

        it('should throw an exception when called on a player with no position', function () {
            (function () { player.getBodyRelativeToPosition(); }).should.throw('Cannot get body relative to position without a position');
        });

        it('should return all of the body segments including the head relative to the position of the player', function () {
            player.setPosition(52, 35);
            player._state.body = [
                new Point(0, 0),
                new Point(-1, 0),
                new Point(-1, 1),
                new Point(-2, 1)
            ];
            player.getBodyRelativeToPosition().should.eql([
                new Point(52, 35),
                new Point(51, 35),
                new Point(51, 36),
                new Point(50, 36)
            ]);
        });
    });

    describe('#getCollisionPoints()', function () {

        it('should return the body relative to the position', function () {
            var body = [
                new Point(2, 3),
                new Point(3, 3),
                new Point(4, 3),
                new Point(4, 4)
            ];
            sinon.stub(player, 'getPosition').returns(body[0]);
            sinon.stub(player, 'getBodyRelativeToPosition').returns(body);
            player.getCollisionPoints().should.equal(body);
        });

        it('should be modifiable by powerUps', function () {
            var powerUp = createPowerUp('modifyCollisionPoints', function (player, points) {
                    return [points[0]];
                }),
                body = [
                    new Point(2, 3),
                    new Point(3, 3),
                    new Point(4, 3),
                    new Point(4, 4)
                ];
            sinon.stub(player, 'getPosition').returns(body[0]);
            sinon.stub(player, 'getBodyRelativeToPosition').returns(body);

            player.consume(powerUp);
            player.getCollisionPoints().should.eql([body[0]]);
        });
    });

    describe('#collides()', function () {

        it('should be modifiable by powerUps', function () {
            var powerUp = createPowerUp('modifyCollides', function (player, displayObject) {
                    return false;
                }),
                collidingPlayer = new Player('colliding');

            sinon.stub(player, 'getPosition').returns(new Point(1, 1));
            sinon.stub(player, 'getBodyRelativeToPosition').returns([new Point(1, 1)]);
            sinon.stub(collidingPlayer, 'getPosition').returns(new Point(1, 1));
            sinon.stub(collidingPlayer, 'getBodyRelativeToPosition').returns([new Point(1, 1)]);

            player.consume(powerUp);
            player.collides(collidingPlayer).should.be.false;
            collidingPlayer.collides(player).should.eql(new Point(1, 1));
        });
    });

    describe('#selfCollides()', function () {

        it('should be modifiable by powerUps', function () {
            var powerUp = createPowerUp('modifySelfCollides', function (player, collides) {
                return false;
            });
            sinon.stub(player, 'getBodyRelativeToPosition').returns([new Point(1, 1), new Point(1, 1)]);
            player.consume(powerUp);
            player.selfCollides().should.be.false;
        });
    });

    describe('#eat()', function () {

        it('should increment the length and update the score of the player', function () {
            player.getLength().should.eql(5);
            player.eat(new Food(0, 0, 3, 5));
            player.getLength().should.eql(8);
            player.getScore().should.eql(5);
        });

        it('should be modifiable by powerUps', function () {
            var powerUpLength = createPowerUp('modifyFoodLength', function (player, length) {
                return length * 2;
            });
            var powerUpPoints = createPowerUp('modifyFoodPoints', function (player, points) {
                return points / 2;
            });
            player.consume(powerUpLength);
            player.getLength().should.eql(5);
            player.eat(new Food(0, 0, 4, 6));
            player.getLength().should.eql(13);

            player.reset();

            player.consume(powerUpPoints);
            player.getScore().should.eql(0);
            player.eat(new Food(0, 0, 4, 6));
            player.getScore().should.eql(3);
        });
    });

    describe('#consume()', function () {

        it('should add the PowerUp to the player', function () {
            var powerUp = new PowerUp();
            player.consume(powerUp);
            player.getPowerUpManager().getPowerUps().length.should.eql(1);
            player.getPowerUpManager().getPowerUps()[0].should.eql(powerUp);
        });
    });

    describe('#move()', function () {

        it('should throw an exception if called when the player has no direction or position', function () {
            (function () { player.move(); }).should.throw('Cannot move without a direction and position');
            player.setDirection('east');
            (function () { player.move(); }).should.throw('Cannot move without a direction and position');
        });

        it('should move the player to the correct position taking into account the speed, increasing the length if required', function () {
            var provider = [
                {
                    speed: 1,
                    direction: 'east',
                    expected: [{ x: 11, y: 10 }, { x: 10, y: 10 }]
                },
                {
                    speed: 1,
                    direction: 'east',
                    expected: [{ x: 12, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 10 }]
                },
                {
                    speed: 1,
                    direction: 'east',
                    expected: [{ x: 13, y: 10 }, { x: 12, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 10 }]
                },
                {
                    speed: 1,
                    direction: 'east',
                    expected: [{ x: 14, y: 10 }, { x: 13, y: 10 }, { x: 12, y: 10 }, { x: 11, y: 10 }]
                },
                {
                    speed: 1,
                    direction: 'south',
                    expected: [{ x: 14, y: 11 }, { x: 14, y: 10 }, { x: 13, y: 10 }, { x: 12, y: 10 }]
                },
                {
                    speed: 1,
                    direction: 'south',
                    expected: [{ x: 14, y:12 }, { x: 14, y: 11 }, { x: 14, y: 10 }, { x: 13, y: 10 }]
                },
                {
                    speed: 1,
                    direction: 'south',
                    expected: [{ x: 14, y: 13 }, { x: 14, y: 12 }, { x: 14, y: 11 }, { x: 14, y: 10 }]
                },
                {
                    speed: 1,
                    direction: 'west',
                    expected: [{ x: 13, y: 13 }, { x: 14, y: 13 }, { x: 14, y: 12 }, { x: 14, y: 11 }]
                },
                {
                    speed: 1,
                    direction: 'west',
                    expected: [{ x: 12, y: 13 }, { x: 13, y: 13 }, { x: 14, y: 13 }, { x: 14, y: 12 }]
                },
                {
                    speed: 1,
                    direction: 'north',
                    expected: [{ x: 12, y: 12 }, { x: 12, y: 13 }, { x: 13, y: 13 }, { x: 14, y: 13 }]
                },
                {
                    speed: 0.5,
                    direction: 'north',
                    expected: [{ x: 12, y: 12 }, { x: 12, y: 13 }, { x: 13, y: 13 }, { x: 14, y: 13 }]
                },
                {
                    speed: 0.5,
                    direction: 'north',
                    expected: [{ x: 12, y: 11 }, { x: 12, y: 12 }, { x: 12, y: 13 }, { x: 13, y: 13 }]
                }
            ];

            player._state.length = 4;
            player.setPosition(10, 10);

            player.getBodyRelativeToHead().should.eql([new Point(0, 0)]);

            _.each(provider, function (data) {
                player.setSpeed(data.speed);
                player.setDirection(data.direction);
                player.move();

                player.getBodyRelativeToHead().length.should.eql(data.expected.length, 'body should be the correct length');
                _.each(data.expected, function (piece, index) {
                    player.getBodyRelativeToPosition()[index].getX().should.eql(piece.x, 'x value of segment ' + index + ' should be correct');
                    player.getBodyRelativeToPosition()[index].getY().should.eql(piece.y, 'y value of segment ' + index + ' should be correct');
                });

            }, this);
        });

    });
});