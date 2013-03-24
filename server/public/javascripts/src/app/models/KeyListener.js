Snake.Models.KeyListener = (function () {

    var KeyListener = Backbone.Model.extend({

        _keyMap: {},

        initialize: function (map) {
            this._keyMap = map || {};
        },

        getListeners: function() {
            return this._keyMap;
        },

        listen: function () {
            $(document).on('keydown', _.bind(this._onKeyPress, this));
        },

        stop: function () {
            $(document).off('keydown', _.bind(this._onKeyPress, this));
        },

        _onKeyPress: function (event) {
            if (_.has(this._keyMap, event.keyCode)) {
                event.preventDefault();
                this.trigger('press', this._keyMap[event.keyCode], event, this);
                this.trigger('press:' + this._keyMap[event.keyCode], event, this);
            }
        }

    });

    return KeyListener;
}());