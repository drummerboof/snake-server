module.exports = (function SpeedMultiplier() {

    var _ = require('lodash'),
        AbstractPowerUp = require('./AbstractPowerUp');

    var SpeedMultiplier = AbstractPowerUp.extend({

        _duration: 10000,

        _multiplier: 2,

        _originalSpeed: null,

        _identifier: 'speed',

        initialize: function (duration, multiplier) {
            SpeedMultiplier.__super__.initialize.apply(this, [duration]);
            if(_.isNumber(multiplier)) {
                this._multiplier = multiplier;
            }
        },

        applyTo: function (player) {
            this._originalSpeed = player.getSpeed();
            player.setSpeed(this._originalSpeed * this._multiplier);
        },

        removeFrom: function (player) {
            player.setSpeed(this._originalSpeed);
        }
    });

    return SpeedMultiplier;

}());