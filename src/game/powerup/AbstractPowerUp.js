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

        /**
         * The unique identifier for the powerUp. This should be
         * overridden in subclasses
         *
         * @property _identifier
         * @private
         */
        _identifier: 'powerup',

        /**
         * Whether or not this powerUp can stack with other instances
         * of the same powerUp.
         *
         * @property _stackable
         * @private
         */
        _stackable: false,

        /**
         * How long the powerUp should last in milliseconds
         *
         * @property _duration
         * @private
         */
        _duration: 0,


        _state: {
            applied: 0
        },

        initialize: function (duration) {
            if(_.isNumber(duration)) {
                this._duration = duration;
            }
        },

        /**
         * Get the id of the powerUp to display on the game matrix
         *
         * @param index
         */
        getCollisionPointId: function (index) {
            return 'powerup:' + this._identifier;
        },

        /**
         * Set the time (milliseconds since epoch) that this powerUp
         * was applied to a player
         *
         * @param time
         */
        setApplied: function (time) {
            this._state.applied = time;
        },

        /**
         * Get the time that this powerUp was applied
         *
         * @returns {number}
         */
        getApplied: function () {
            return this._state.applied;
        },

        /**
         * Apply this PowerUp to a player
         *
         * @param player
         */

        apply: function (player) {
            this.setApplied(Date.now());
            this.applyTo(player);
        },

        /**
         * Method to be overridden by subclasses who want to act on the
         * player when the powerUp is added
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
        remove: function (player) {
            this.removeFrom(player);
            this.setApplied(0);
        },

        /**
         * Method to be overridden by subclasses who want to act on the
         * player when the powerUp is removed
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

        /**
         * Override the _serialize to add the duration to the state
         *
         * @param state
         * @returns {Function}
         * @private
         */
        _serialize: function (state) {
            state = AbstractPowerUp.__super__._serialize.apply(this, arguments);
            state.duration = this._duration;
            return state;
        }


    });

    AbstractPowerUp.extend = util.extend;

    return AbstractPowerUp;
}());