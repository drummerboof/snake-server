module.exports = (function Matrix() {

    var _ = require('lodash'),
        Point = require('./Point'),
        GameObject = require('./GameObject');

    var statics = {
        QUADRANT_NORTHEAST: 'northeast',
        QUADRANT_NORTHWEST: 'northwest',
        QUADRANT_SOUTHEAST: 'southeast',
        QUADRANT_SOUTHWEST: 'southwest'
    };

    var Matrix = GameObject.extend({

        _state: [],

        initialize: function (width, height) {
            for (var x = 0; x < width; x++) {
                this._state[x] = [];
                for (var y = 0; y < height; y++) {
                    this._state[x][y] = null;
                }
            }
        },

        width: function () {
            return this._state.length;
        },

        height: function () {
            return this._state[0].length;
        },

        set: function (x, y, value) {
            if (!this._checkBounds(x, y)) {
                throw new Error('Co-ordinates are out of bounds');
            }
            this._state[x][y] = value;
        },

        get: function (x, y) {
            if (!this._checkBounds(x, y)) {
                throw new Error('Co-ordinates are out of bounds');
            }
            return this._state[x][y];
        },

        clear: function (x, y) {
            if (!this._checkBounds(x, y)) {
                throw new Error('Co-ordinates are out of bounds');
            }
            this._state[x][y] = null;
        },

        reset: function () {
            this.initialize(this.width(), this.height());
        },

        isInBounds: function (point) {
            return this._checkBounds(point.getX(), point.getY());
        },

        getPointQuadrant: function (point) {
            if (!this.isInBounds(point)) {
                throw new Error('Co-ordinates are out of bounds');
            }
            var centrePoint = new Point(Math.floor(this.width() / 2), Math.floor(this.height() / 2)),
                quadrant = statics.QUADRANT_NORTHWEST;

            if (point.getX() >= centrePoint.getX() && point.getY() >= centrePoint.getY()) {
                quadrant = statics.QUADRANT_SOUTHEAST;
            } else if (point.getX() >= centrePoint.getX() && point.getY() < centrePoint.getY()) {
                quadrant = statics.QUADRANT_NORTHEAST;
            } else if (point.getX() < centrePoint.getX() && point.getY() >= centrePoint.getY()) {
                quadrant = statics.QUADRANT_SOUTHWEST;
            }
            return quadrant;
        },

        getNextEmptyCellFromPoint: function (point) {
            var original = new Point(point.getX(), point.getY());
            while (this.get(point.getX(), point.getY()) !== null) {
                point.setX(point.getX() + 1);
                if (point.getX() >= this.width()) {
                    point.setX(0);
                    point.setY(point.getY() >= this.height() - 1 ? 0 : point.getY() + 1);
                }
                if (point.equals(original)) {
                    throw new Error('No empty cells left in matrix');
                }
            }
            return point;
        },

        _checkBounds: function (x, y) {
            return (x < this.width() && x >= 0
                &&  y < this.height() && y >= 0);
        }

    }, statics);

    return Matrix;

}());