module.exports = (function Player() {

    var _ = require('lodash'),
        util = require('../util'),
        Backbone = require('backbone');

    var GameObject = function () {
        this._state = _.clone(this._state, true);
        this.initialize.apply(this, arguments);
    };

    _.extend(GameObject.prototype, {

        /**
         * Internal state values of this object. This will hold all the information
         * about the object. This should not be accessed directly.
         */
        _state: {},

        /**
         * Method run in the constructor to be overriden with any custom construct-time logic.
         * Arguments from the constructor are passed through to this method
         *
         * @private
         */
        initialize: function () {

        },

        /**
         * Recursively serialize this game object and all child game objects
         * for representation to the client.
         */
        serialize: function () {
            var processed = this._serialize(_.clone(this._state));
            _.each(processed, function (value, key) {
                if (_.isArray(value)) {
                    processed[key] = _.map(value, function (subvalue, subkey) {
                        return (subvalue instanceof GameObject) ? subvalue.serialize() : subvalue;
                    });
                } else if (value instanceof GameObject) {
                    processed[key] = value.serialize();
                }
            });
            return processed;
        },

        /**
         * Carry out any additional processing of the state before it is serialized
         *
         * @private
         */
        _serialize: function (state) {
            return state;
        }

    }, Backbone.Events);

    GameObject.extend = util.extend;

    return GameObject;

}());