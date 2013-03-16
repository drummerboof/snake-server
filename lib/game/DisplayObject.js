module.exports = (function DisplayObject() {

    var _ = require('lodash'),
        Point = require('./Point'),
        GameObject = require('./GameObject');

    var DisplayObject = GameObject.extend({

        /**
         * String to identify this type of object
         */
        _identifier: 'DisplayObject',

        _position: null,

        _serialize: function (state) {
            state.position = this._position;
            return state;
        },

        getId: function () {
            return this._identifier;
        },

        setPosition: function () {
            var point;
            if (arguments.length === 2) {
                point = new Point(arguments[0], arguments[1]);
            } else {
                point = arguments[0];
            }
            this._position = point;
        },

        getPosition: function () {
            return this._position;
        },

        /**
         * Check whether this display object collides with another display object by checking each
         * collision point against points from the other. Will return the point at which the collision
         * occurs or false
         *
         * @param displayObject
         * @return {*|Boolean}
         */
        collides: function (displayObject) {
            var collisionPoint = _.find(this.getCollisionPoints(), function (localPoint) {
                var collision = _.find(displayObject.getCollisionPoints(), function (point) {
                    return point.equals(localPoint);
                }, this);
                return !_.isUndefined(collision);
            }, this);
            return collisionPoint || false;
        },

        /**
         * Get an array of points which represent all possible collision points for this display object.
         * This ca be overriden in subclasses to add other points to the list
         *
         * @return {Array}
         */
        getCollisionPoints: function () {
            return [this._position];
        }

    });

    return DisplayObject;

}());