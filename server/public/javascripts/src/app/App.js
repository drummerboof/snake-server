Snake.App = (function () {

    var App = Backbone.View.extend({

        _keyMap: {
            37: 'west',
            38: 'north',
            39: 'east',
            40: 'south',
            13: 'enter',
            32: 'space'
        },

        initialize: function (options) {
            this._initializeGlobalEvents();
            this.messages = new Snake.Views.Messages();
            this.game = new Snake.Views.Game(_.extend(options, {
                keyListener: new Snake.Models.KeyListener(this._keyMap)
            }));
        },

        _initializeGlobalEvents: function () {
            App.on('message:flash', function (message, duration) {
                this.messages.flash(message, duration);
            }, this);

            App.on('error:flash', function (error, duration) {
                this.messages.flash(error, duration, Snake.Views.Messages.ERROR);
            }, this);

            App.on('message:show', function (message) {
                this.messages.render(message);
            }, this);

            App.on('error:show', function (error) {
                this.messages.render(error, Snake.Views.Messages.ERROR);
            }, this);

            App.on('messages:clear', function (error, duration) {
                this.messages.clear();
            }, this);
        }

    }, Backbone.Events);

    return App;
}());