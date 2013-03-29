module.exports = (function PowerUpManager() {

    var _ = require('lodash');

    var PowerUpManager = function (player) {
        this._player = player;
        this._powerUps = [];
        this._hooks = {};
    };

    PowerUpManager.prototype = {

        _player: null,

        _powerUps: null,

        _hooks: null,

        getPowerUps: function () {
            return _.pluck(this._powerUps, 'effect');
        },

        getRegisteredHooks: function () {
            return _.keys(this._hooks);
        },

        hook: function () {
            var powerUpArgs = _.values(arguments),
                hookName = powerUpArgs.shift();
            this._hooks[hookName] = true;
            _.each(this._powerUps, function (powerUp) {
                if (_.isFunction(powerUp.effect[hookName])) {
                    powerUpArgs[0] = powerUp.effect[hookName].apply(
                        powerUp.effect,
                        _.union([this._player], powerUpArgs)
                    );
                }
            }, this);
            return powerUpArgs[0];
        },

        add: function (powerUp) {
            if (powerUp.isStackable() || !this.has(powerUp.getId())) {
                powerUp.applyTo(this._player);
                this._powerUps.push({
                    effect: powerUp,
                    applied: Date.now()
                });
            }
        },

        has: function (powerUpId) {
            return !!_.find(this.getPowerUps(), function (powerUp) {
                return powerUp.getId() === powerUpId;
            });
        },

        clear: function () {
            _.each(this._powerUps, function (powerUp) {
                powerUp.effect.removeFrom(this._player);
            }, this);
            this._powerUps = [];
            this._hooks = {};
        },

        purgeExpired: function () {
            this._powerUps = _.reject(this._powerUps, function (powerUp) {
                if (Date.now() >= powerUp.applied + powerUp.effect.getDuration()) {
                    powerUp.effect.removeFrom(this._player);
                    return true;
                }
                return false;
            }, this);
        }

    };

    return PowerUpManager;

}());