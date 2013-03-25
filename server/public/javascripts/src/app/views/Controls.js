Snake.Views.Controls = (function () {

    var Controls = Backbone.View.extend({

        el: '#controls',

        fields: null,

        events: {
            'click #controls-play-pause': '_onPlayPauseClick',
            'click #controls-join-button': '_onJoinClick'
        },

        _buttonText: {
            paused: 'play',
            over: 'reset',
            playing: 'pause'
        },

        initialize: function (options) {
            this.player = options.player;
            this.game = options.model;
            this.template = _.template($('#template-controls').html());
            this.game.on('player:join:success', this.render, this);
            this.game.on('change:status', this.render, this);
            this.player.on('change:name', this.render, this);
        },

        render: function () {
            var player = this.game.players.get(this.player.get('name'));
            this.$el.html(this.template({
                name: this.player.get('name'),
                status: this.model.get('status'),
                button: this._buttonText[this.model.get('status')]
            }));
            this.$el.removeClass('playing waiting').addClass(player ? 'playing' : 'waiting');
            return this;
        },

        _onPlayPauseClick: function () {
            this.model[this._buttonText[this.model.get('status')]]();
        },

        _onJoinClick: function () {
            var playerField = this.$('#controls-player-name');
            if (playerField) {
                if (playerField.val() === '') {
                    Snake.App.trigger('error:flash', 'Please enter a player name');
                } else {
                    this.player.set({ name: playerField.val() });
                    this.player.trigger('join', this.player);
                }
            }
        }
    });

    return Controls;
}());