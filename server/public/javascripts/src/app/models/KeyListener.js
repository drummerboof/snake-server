Snake.Models.KeyListener = (function () {

    var KeyListener = Backbone.Model.extend({

        _keyMap: {},

        initialize: function (map) {
            this._keyMap = map || {};
            this._scopedKeyPress = _.bind(this._onKeyPress, this);
        },

        getListeners: function() {
            return this._keyMap;
        },

        listen: function () {
            console.log('listening');
            $(document).on('keydown', this._scopedKeyPress);
        },

        stop: function () {
            $(document).off('keydown', this._scopedKeyPress);
        },

        _onKeyPress: function (event) {
            if (_.has(this._keyMap, event.keyCode)) {
                event.preventDefault();
                this.trigger('press', this._keyMap[event.keyCode], event, this);
                this.trigger('press:' + this._keyMap[event.keyCode], this._keyMap[event.keyCode], event, this);
            }
        }

    });

    return KeyListener;
}());