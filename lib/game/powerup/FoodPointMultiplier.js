module.exports = (function FoodPointMultiplier() {

    var _ = require('lodash'),
        AbstractPowerUp = require('./AbstractPowerUp');

    var FoodPointMultiplier = AbstractPowerUp.extend({

        _stackable: true,

        _duration: 10000,

        _multiplier: 2,

        _identifier: 'points',

        initialize: function (duration, multiplier) {
            FoodPointMultiplier.__super__.initialize.apply(this, [duration]);
            if(_.isNumber(multiplier)) {
                this._multiplier = multiplier;
            }
        },

        modifyFoodPoints: function (player, points) {
            return points * this._multiplier;
        }

    });

    return FoodPointMultiplier;

}());