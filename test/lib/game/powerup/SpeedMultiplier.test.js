describe('SpeedMultiplierPowerUp', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Player = require('../../../../lib/game/Player'),
        SpeedMultiplierPowerUp = require('../../../../lib/game/powerup/SpeedMultiplier');

    describe('#getId()', function () {
        it('should return the correct identifier', function () {
            var speedMultiplier = new SpeedMultiplierPowerUp();
            speedMultiplier.getId().should.eql('speed');
        });
    });

    describe('#isStackable()', function () {
        it('should return false', function () {
            var speedMultiplier = new SpeedMultiplierPowerUp();
            speedMultiplier.isStackable().should.be.false;
        });
    });

    describe('#applyTo()', function () {
        it('should set the speed of the player', function () {
            var speedMultiplierDefault = new SpeedMultiplierPowerUp(5000),
                speedMultiplierThree= new SpeedMultiplierPowerUp(5000, 3),
                player = new Player('test');

            sinon.spy(player, 'setSpeed');

            player.setSpeed(0.5);
            speedMultiplierDefault.applyTo(player);
            player.setSpeed.calledWithExactly(1).should.be.true;

            player.setSpeed(0.5);
            speedMultiplierThree.applyTo(player);
            player.setSpeed.calledWithExactly(1.5).should.be.true;
        });
    });

    describe('#removeFrom()', function () {
        it('should reset the speed of the player', function () {
            var speedMultiplier = new SpeedMultiplierPowerUp(),
                player = new Player('test');

            player.setSpeed(0.5);
            speedMultiplier.applyTo(player);

            sinon.spy(player, 'setSpeed');

            speedMultiplier.removeFrom(player);
            player.setSpeed.calledWithExactly(0.5).should.be.true;
        });
    });

});