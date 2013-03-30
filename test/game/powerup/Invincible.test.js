describe('InvinciblePowerUp', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Food = require('../../../src/game/Food'),
        Player = require('../../../src/game/Player'),
        InvinciblePowerUp = require('../../../src/game/powerup/Invincible');

    describe('#getId()', function () {
        it('should return the correct identifier', function () {
            var invincible = new InvinciblePowerUp();
            invincible.getId().should.eql('invincible');
        });
    });

    describe('#isStackable()', function () {
        it('should return false', function () {
            var invincible = new InvinciblePowerUp();
            invincible.isStackable().should.be.false;
        });
    });

    describe('#modifyCollides()', function () {
        it('should return false if the displayObject is a player', function () {
            var invincible = new InvinciblePowerUp(),
                provider = [{
                    collides: true,
                    displayObject: new Food(0, 0, 0, 0),
                    expected: true
                }, {
                    collides: true,
                    displayObject: new Player('test'),
                    expected: false
                }, {
                    collides: false,
                    displayObject: new Food(0, 0, 0, 0),
                    expected: false
                }];

            _.each(provider, function (data) {
                invincible.modifyCollides(null, data.collides, data.displayObject).should.eql(data.expected);
            }, this);
        });
    });

    describe('#modifySelfCollides()', function () {
        it('should return false', function () {
            var invincible = new InvinciblePowerUp();
            invincible.modifySelfCollides(null, true).should.be.false;
            invincible.modifySelfCollides(null, false).should.be.false;
        });
    });

});