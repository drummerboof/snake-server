describe('AbstractPowerUp', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Point = require('../../../../lib/game/Point'),
        AbstractPowerUp = require('../../../../lib/game/powerup/AbstractPowerUp');

    var ConcretePowerUp = AbstractPowerUp.extend({
        _identifier: 'test',
        _duration: 5000
    });

    describe('#AbstractPowerUp()', function () {
        it('should set the duration of the powerUp', function () {
            var powerUp = new ConcretePowerUp(4000);
            powerUp.getDuration().should.eql(4000);
        });
    });

    describe('#serialize()', function () {

        it('should include the duration', function () {
            var powerUp = new ConcretePowerUp();
            powerUp.setPosition(new Point(0, 0));
            powerUp.serialize().should.eql({
                id: 'test',
                position: {
                    x: 0,
                    y: 0
                },
                points: [{
                    x: 0,
                    y: 0
                }],
                duration: 5000
            });
        });
    });

    describe('#getCollisionPointId()', function () {

        it('should return the correct ID for the PowerUp', function () {
            var powerUp = new ConcretePowerUp();
            powerUp.getCollisionPointId().should.eql('powerup:test');
        });
    });

    describe('#getDuration()', function () {

        it('should return the duration of the powerup in seconds', function () {
            var powerUp = new ConcretePowerUp();
            powerUp.getDuration().should.eql(5000);
        });
    });
});