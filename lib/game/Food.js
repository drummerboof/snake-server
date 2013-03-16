module.exports = (function Food() {

    var _ = require('lodash'),
        Point = require('./Point'),
        DisplayObject = require('./DisplayObject');

    var Food = DisplayObject.extend({

        _identifier: 'food',

        _state: {
            value: 1
        },

        initialize: function (x, y, value) {
            this.setValue(_.isUndefined(value) ? 1 : value);
            this._position = new Point(x, y);
        },

        getValue: function () {
            return this._state.value;
        },

        setValue: function (value) {
            if (!_.isNumber(value)) {
                throw new Error('Value must be numeric');
            }
            this._state.value = value;
        }

    });

    return Food;

}());