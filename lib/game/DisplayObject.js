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

        /**
         * Set the position of this display object
         * Accepts either an x and y value, or a point instance
         */
        setPosition: function () {
            var point;
            if (arguments.length === 2) {
                point = new Point(arguments[0], arguments[1]);
            } else if (arguments.length === 1) {
                point = arguments[0];
            } else {
                throw new Error('Must specify a position');
            }
            this._position = point;
        },

        /**
         * Get the current position of the display object as a Point instance
         *
         * @returns {Point}
         */
        getPosition: function () {
            return this._position;
        },

        /**
         * This should be overriden by subclasses who might have some conditions
         * under which they should not be rendered
         *
         * @return Boolean
         */
        shouldRender: function () {
            return true;
        },

        /**
         * Check whether this display object collides with another display object by checking each
         * collision point against points from the other. Will return the point at which the collision
         * occurs or false
         *
         * @param displayObject
         * @return {Point|Boolean}
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
         * Return the point at which any of the collision points of the display object
         * are overlapping, or false
         *
         * @return {Point|Boolean}
         */
        selfCollides: function () {
            var collision = _.find(this.getCollisionPoints(), function (point) {
                return _.filter(this.getCollisionPoints(), function (innerPoint) {
                    return innerPoint.equals(point);
                }).length > 1;
            }, this);
            return collision || false;
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