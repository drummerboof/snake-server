module.exports = (function Food() {

    var _ = require('lodash'),
        Point = require('./Point'),
        DisplayObject = require('./DisplayObject');

    var Food = DisplayObject.extend({

        _identifier: 'food',

        _state: {
            points: 1,
            value: 1
        },

        initialize: function (x, y, value, points) {
            this._state.value = !_.isNumber(value) ? this._state.value : value;
            this._state.points = !_.isNumber(points) ? this._state.points : points;
            this._position = new Point(x, y);
        },

        getValue: function () {
            return this._state.value;
        },

        getPoints: function () {
            return this._state.points;
        }

    });

    return Food;

}());