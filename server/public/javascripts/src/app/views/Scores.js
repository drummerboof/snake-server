Snake.Views.Scores = (function () {

    var Scores = Backbone.View.extend({

        el: '#scores',

        initialize: function (options) {
            this.template = _.template($('#template-scores').html());
            this.model.on('change:score', this.render, this);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return Scores;
}());