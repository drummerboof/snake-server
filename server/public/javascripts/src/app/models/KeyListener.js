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
            this.stop();
            $(document).on('keydown', this._scopedKeyPress);
            console.log('Listening for keys...');
        },

        stop: function () {
            $(document).off('keydown', this._scopedKeyPress);
            console.log('Stopped listening for keys...');
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