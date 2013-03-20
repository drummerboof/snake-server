describe('Player', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Player = require('../../../lib/game/Player'),
        Point = require('../../../lib/game/Point'),
        player;

    beforeEach(function () {
        player = new Player('test');
    });

    describe('#Player()', function () {

        it('should throw an exception if given a valid name in the constructor', function () {
            (function () { new Player(); }).should.throw('Player name must be defined');
            (function () { new Player(4); }).should.throw('Player name must be defined');
        });

        it('should set the length of the player if provided in the constructor', function () {
            var longPlayer = new Player('bob', 10);
            player.getLength().should.eql(5);
            longPlayer.getLength().should.eql(10);
        });

        it('should initialize a body with one segment at 0, 0 local co-ordinates', function () {
            player.getBodyRelativeToHead().should.eql([new Point(0, 0)]);
        });
    });

    describe('#getId()', function () {

        it('should return the correct identifier for the player', function () {
            player.getId().should.eql('player:test');
        });
    });

    describe('#kill()', function () {

        it('should set the players alive flag to false', function () {
            player.isAlive().should.be.true;
            player.kill();
            player.isAlive().should.be.false;
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

        it('should set the direction when given a valid value', function () {
            _.each(['north', 'east', 'south', 'west'], function (direction) {
                player.setDirection(direction);
                player.getDirection().should.eql(direction);
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
            sinon.stub(player, 'getBodyRelativeToPosition').returns(body);
            player.getCollisionPoints().should.equal(body);
        });
    });

    describe('#eat()', function () {

        it('should increment the length by the given amount or 1 if no amount given', function () {
            player.eat();
            player.getLength().should.eql(6);
            player.eat(3);
            player.getLength().should.eql(9);
        });
    });

    describe('#move()', function () {

        it('should throw an exception if called when the player has no direction', function () {
            (function () { player.move(); }).should.throw('Cannot move without a direction');
        });

        it('should move the player to the correct position, increasing the length if required', function () {
            var provider = [
                {
                    direction: 'east',
                    expected: [{ x: 0, y: 0 }, { x: -1, y: 0 }]
                },
                {
                    direction: 'east',
                    expected: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -2, y: 0 }]
                },
                {
                    direction: 'east',
                    expected: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -2, y: 0 }, { x: -3, y: 0 }]
                },
                {
                    direction: 'east',
                    expected: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -2, y: 0 }, { x: -3, y: 0 }]
                },
                {
                    direction: 'south',
                    expected: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: -2, y: -1 }]
                },
                {
                    direction: 'south',
                    expected: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: -2 }, { x: -1, y: -2 }]
                },
                {
                    direction: 'south',
                    expected: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: -2 }, { x: 0, y: -3 }]
                },
                {
                    direction: 'west',
                    expected: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 1, y: -2 }]
                },
                {
                    direction: 'west',
                    expected: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: -1 }]
                },
                {
                    direction: 'north',
                    expected: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }]
                },
                {
                    direction: 'north',
                    expected: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }]
                }
            ];

            player._state.length = 4;
            player.setPosition(0, 0);

            player.getBodyRelativeToHead().should.eql([new Point(0, 0)]);

            _.each(provider, function (data) {
                player.setDirection(data.direction);
                player.move();

                player.getBodyRelativeToHead().length.should.eql(data.expected.length, 'body should be the correct length');
                _.each(data.expected, function (piece, index) {
                    player.getBodyRelativeToHead()[index].getX().should.eql(piece.x, 'x value of segment ' + index + ' should be correct');
                    player.getBodyRelativeToHead()[index].getY().should.eql(piece.y, 'y value of segment ' + index + ' should be correct');
                });

            }, this);
        });

    });
});