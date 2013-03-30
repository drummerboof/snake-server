describe('FoodLengthMultiplierPowerUp', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        FoodLengthMultiplierPowerUp = require('../../../../lib/game/powerup/FoodLengthMultiplier');

    describe('#getId()', function () {
        it('should return the correct identifier', function () {
            var foodLengthMultiplier = new FoodLengthMultiplierPowerUp();
            foodLengthMultiplier.getId().should.eql('length');
        });
    });

    describe('#isStackable()', function () {
        it('should return false', function () {
            var foodLengthMultiplier = new FoodLengthMultiplierPowerUp();
            foodLengthMultiplier.isStackable().should.be.false;
        });
    });

    describe('#getCollisionPointId()', function () {
        it('should return the correct identifier', function () {
            var foodLengthMultiplier = new FoodLengthMultiplierPowerUp();
            foodLengthMultiplier.getCollisionPointId().should.eql('powerup:length');
        });
    });

    describe('#modifyFoodPoints()', function () {
        it('should return the value multiplied by the multiplier', function () {
            var foodLengthMultiplierDefault = new FoodLengthMultiplierPowerUp(5000),
                foodLengthMultiplierThree= new FoodLengthMultiplierPowerUp(5000, 3);

            foodLengthMultiplierDefault.modifyFoodLength(null, 5).should.eql(0);
            foodLengthMultiplierThree.modifyFoodLength(null, 4).should.eql(12);
        });
    });

});