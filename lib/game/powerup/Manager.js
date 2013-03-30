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

        _lastPaused: false,

        getPowerUps: function () {
            return this._powerUps;
        },

        getRegisteredHooks: function () {
            return _.keys(this._hooks);
        },

        hook: function () {
            var powerUpArgs = _.values(arguments),
                hookName = powerUpArgs.shift();
            this._hooks[hookName] = true;
            _.each(this.getPowerUps(), function (powerUp) {
                if (_.isFunction(powerUp[hookName])) {
                    powerUpArgs[0] = powerUp[hookName].apply(
                        powerUp,
                        _.union([this._player], powerUpArgs)
                    );
                }
            }, this);
            return powerUpArgs[0];
        },

        add: function (powerUp) {
            if (powerUp.isStackable() || !this.has(powerUp.getId())) {
                powerUp.apply(this._player);
                this._powerUps.push(powerUp);
            } else {
                _.find(this.getPowerUps(), function (savedPowerUp) {
                    return savedPowerUp.getId() === powerUp.getId();
                }).setApplied(Date.now());
            }
        },

        has: function (powerUpId) {
            return !!_.find(this.getPowerUps(), function (powerUp) {
                return powerUp.getId() === powerUpId;
            });
        },

        pause: function () {
            this._lastPaused = Date.now();
        },

        resume: function () {
            if (this._lastPaused !== false) {
                _.each(this.getPowerUps(), function (powerUp) {
                    powerUp.setApplied(powerUp.getApplied() + Date.now() - this._lastPaused);
                }, this);
                this._lastPaused = false;
            }
        },

        clear: function () {
            _.each(this.getPowerUps(), function (powerUp) {
                powerUp.remove(this._player);
            }, this);
            this._powerUps = [];
            this._hooks = {};
        },

        purgeExpired: function () {
            if (this._lastPaused === false) {
                this._powerUps = _.reject(this.getPowerUps(), function (powerUp) {
                    if (Date.now() >= powerUp.getApplied() + powerUp.getDuration()) {
                        powerUp.remove(this._player);
                        return true;
                    }
                    return false;
                }, this);
            }
        }

    };

    return PowerUpManager;

}());