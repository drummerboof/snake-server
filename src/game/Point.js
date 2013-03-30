module.exports = (function Point() {

    var _ = require('lodash'),
        GameObject = require('./GameObject');

    var statics = {
        random: function (maxX, maxY) {
            return new Point(
                Math.floor(Math.random() * (maxX + 1)),
                Math.floor(Math.random() * (maxY + 1))
            );
        }
    };

    var Point = GameObject.extend({

        _state: {
            x: null,
            y: null
        },

        initialize: function (x, y) {
            this.set(x, y);
        },

        /**
         * Set the x and y component together
         *
         * @param x
         * @param y
         */
        set: function (x, y) {
            this.setX(x);
            this.setY(y);
        },

        /**
         * Set the x component of the point. Will throw an error if the value is not numeric
         *
         * @param x
         */
        setX: function (x) {
            if (!_.isNumber(x)) {
                throw new Error('Value for x must be numeric');
            }
            this._state.x = x;
        },

        /**
         * Set the y component of the point. Will throw an error if the value is not numeric
         *
         * @param y
         */
        setY: function (y) {
            if (!_.isNumber(y)) {
                throw new Error('Value for y must be numeric');
            }
            this._state.y = y;
        },

        /**
         * Get the x component of the point
         *
         * @return {*}
         */
        getX: function () {
            return this._state.x;
        },

        /**
         * get the y component of the point
         *
         * @return {*}
         */
        getY: function () {
            return this._state.y;
        },

        /**
         * Returns true if the point provided has the same x and y values as this one
         *
         * @param point
         */
        equals: function (point) {
            return (this.getX() === point.getX() && this.getY() === point.getY())
        },

        /**
         * Add a point to this point and return the resulting point
         *
         * @param point
         * @return {*}
         */
        add: function (point) {
            return new Point(
                this.getX() + point.getX(),
                this.getY() + point.getY()
            );
        },

        /**
         * Subtract a point from this one and return the resulting point
         *
         * @param point
         * @return {*}
         */
        subtract: function (point) {
            return new Point(
                this.getX() - point.getX(),
                this.getY() - point.getY()
            );
        },

        /**
         * Invert the sign of each component of the point
         *
         * @return {*}
         */
        invert: function () {
            return new Point(
                -this.getX(),
                -this.getY()
            );
        }
    }, statics);

    return Point;

}());