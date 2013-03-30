describe('AbstractPowerUp', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Point = require('../../../src/game/Point'),
        Player = require('../../../src/game/Player'),
        AbstractPowerUp = require('../../../src/game/powerup/AbstractPowerUp');

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
                applied: 0,
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

    describe('#apply()', function () {

        it('should set the time applied and call #applyTo()', function () {
            var powerUp = new ConcretePowerUp(),
                player = new Player('test'),
                clock = sinon.useFakeTimers(1234);

            sinon.stub(powerUp, 'setApplied');
            sinon.stub(powerUp, 'applyTo');

            powerUp.apply(player);
            powerUp.setApplied.calledWithExactly(1234).should.be.true;
            powerUp.applyTo.calledWithExactly(player).should.be.true;

            clock.restore();
        });
    });

    describe('#remove()', function () {

        it('should clear the time applied and call #removeFrom()', function () {
            var powerUp = new ConcretePowerUp(),
                player = new Player('test');

            sinon.stub(powerUp, 'setApplied');
            sinon.stub(powerUp, 'removeFrom');

            powerUp.apply(player);
            powerUp.remove(player);
            powerUp.setApplied.calledWithExactly(0).should.be.true;
            powerUp.removeFrom.calledWithExactly(player).should.be.true;
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