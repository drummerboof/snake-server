Snake.Collections.Players = (function () {

    var Players = Backbone.Collection.extend({

        comparator: function (player) {
            return -player.get('score');
        }
    });

    return Players;
}());