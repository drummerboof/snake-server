describe('FoodPointMultiplierPowerUp', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        FoodPointMultiplierPowerUp = require('../../../src/game/powerup/FoodPointMultiplier');

    describe('#getId()', function () {
        it('should return the correct identifier', function () {
            var foodPointMultiplier = new FoodPointMultiplierPowerUp();
            foodPointMultiplier.getId().should.eql('points');
        });
    });

    describe('#isStackable()', function () {
        it('should return true', function () {
            var foodPointMultiplier = new FoodPointMultiplierPowerUp();
            foodPointMultiplier.isStackable().should.be.true;
        });
    });

    describe('#getCollisionPointId()', function () {
        it('should return the correct identifier', function () {
            var foodPointMultiplier = new FoodPointMultiplierPowerUp();
            foodPointMultiplier.getCollisionPointId().should.eql('powerup:points');
        });
    });

    describe('#modifyFoodPoints()', function () {
        it('should return the value multiplied by the multiplier', function () {
            var foodPointMultiplierDefault = new FoodPointMultiplierPowerUp(5000),
                foodPointMultiplierThree= new FoodPointMultiplierPowerUp(5000, 3);

            foodPointMultiplierDefault.modifyFoodPoints(null, 5).should.eql(10);
            foodPointMultiplierThree.modifyFoodPoints(null, 4).should.eql(12);
        });
    });

});