/**
 * Things to hook into on player:
 *  - length on eat (No Grow)
 *  - score on eat (Double Points)
 *  - collision checking (Invincibility)
 *  - Food proximity? (Lazy Eater)
 */
module.exports = (function AbstractPowerUp() {

    var _ = require('lodash'),
        util = require('../../util'),
        DisplayObject = require('../DisplayObject');

    var AbstractPowerUp = DisplayObject.extend({

        _identifier: 'powerup',

        _stackable: false,

        _duration: 0,

        initialize: function (duration) {
            if(_.isNumber(duration)) {
                this._duration = duration;
            }
        },

        /**
         * Get the id of the powerup to display on the game matrix
         *
         * @param index
         */
        getCollisionPointId: function (index) {
            return 'powerup:' + this._identifier;
        },

        /**
         * Apply this PowerUp to a player
         *
         * @param player
         */
        applyTo: function (player) {

        },

        /**
         * Remove the PowerUp from the given player
         *
         * @param player
         */
        removeFrom: function (player) {

        },

        /**
         * Return the duration of the PowerUp in seconds
         *
         * @returns {number}
         */
        getDuration: function () {
            return this._duration;
        },

        /**
         * Whether or not this power up is stackable
         *
         * @returns {boolean}
         */
        isStackable: function() {
            return this._stackable;
        },

        _serialize: function (state) {
            state = AbstractPowerUp.__super__._serialize.apply(this, arguments);
            state.duration = this._duration;
            return state;
        }


    });

    AbstractPowerUp.extend = util.extend;

    return AbstractPowerUp;
}());