module.exports = (function FoodLengthMultiplier() {

    var _ = require('lodash'),
        AbstractPowerUp = require('./AbstractPowerUp');

    var FoodLengthMultiplier = AbstractPowerUp.extend({

        _duration: 10000,

        _multiplier: 0,

        _identifier: 'length',

        initialize: function (duration, multiplier) {
            FoodLengthMultiplier.__super__.initialize.apply(this, [duration]);
            if(_.isNumber(multiplier)) {
                this._multiplier = multiplier;
            }
        },

        modifyFoodLength: function (player, length) {
            return length * this._multiplier;
        }

    });

    return FoodLengthMultiplier;

}());