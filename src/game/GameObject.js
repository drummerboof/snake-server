module.exports = (function GameObject() {

    var _ = require('lodash'),
        util = require('../util'),
        Backbone = require('backbone');

    var GameObject = function () {
        this._state = _.clone(this._state, true);
        this._defaultProperties = [];
        if (this._defaultProperties.length > 0) {
            this._defaults = _.clone(_.pick(this._state, this._defaultProperties));
        }
        this.initialize.apply(this, arguments);
    };

    _.extend(GameObject.prototype, {

        /**
         * An array of default attributes which if populated ina subclass will result in
         * those attributes being copied into a _defaults property after initialize
         */
        _defaultProperties: null,

        /**
         * The defaults used if _defaultProperties is used
         */
        _defaults: null,

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

        reset: function () {
            this._state = _.extend({}, this._state, this._defaults);
        },

        /**
         * Recursively serialize this game object and all child game objects
         * for representation to the client.
         */
        serialize: function () {
            var processed = this._serialize(_.clone(this._state));
            // Use for in as a length property (such as the one on the player) confuses _.each
            for (var key in processed) {
                if (_.has(processed, key)) {
                    var value = processed[key];
                    if (_.isArray(value)) {
                        processed[key] = _.map(value, function (subvalue, subkey) {
                            return (subvalue instanceof GameObject) ? subvalue.serialize() : subvalue;
                        });
                    } else if (value instanceof GameObject) {
                        processed[key] = value.serialize();
                    }
                }
            }
            return processed;
        },

        /**
         * Carry out any additional processing of the state before it is serialized
         * This is passed a shallow clone of the object._state
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
