Snake.Models.Player = (function () {

    var Player = Backbone.Model.extend({

        defaults: {
            score: 0,
            direction: null
        },

        directions: ['north', 'south', 'east', 'west'],

        initialize: function () {

        }
    });

    return Player
}());