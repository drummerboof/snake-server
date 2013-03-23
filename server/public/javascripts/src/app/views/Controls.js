Snake.Views.Controls = Backbone.View.extend({

    el: '#controls',

    events: {
        'click #controls-play-pause': '_onPlayPauseClick'
    },

    _buttonText: {
        paused: 'play',
        over: 'reset',
        playing: 'pause'
    },

    initialize: function (options) {
        this.template = _.template($('#template-controls').html());
        this.model.on('change:status', this.render, this);
    },

    render: function () {
        this.$el.html(this.template({
            text: this._buttonText[this.model.get('status')]
        }));
    },

    _onPlayPauseClick: function () {
        console.log('click');
        this.model.trigger(this._buttonText[this.model.get('status')], this);
    }
});