Snake.Collections.Players = Backbone.Collection.extend({

    model: Snake.Models.Player,

    comparator: function (player) {
        return -player.get('score');
    }
});