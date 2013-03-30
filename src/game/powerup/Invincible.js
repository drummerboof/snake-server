module.exports = (function Invincible() {

    var AbstractPowerUp = require('./AbstractPowerUp'),
        Player = require('../Player');

    var Invincible = AbstractPowerUp.extend({

        _duration: 10000,

        _identifier: 'invincible',

        modifyCollides: function (player, collides, displayObject) {
            return collides && !(displayObject instanceof Player);
        },

        modifySelfCollides: function (player, collides) {
            return false;
        }

    });

    return Invincible;

}());