module.exports = (function Game() {

    var _ = require('lodash'),
        GameObject = require('./GameObject'),
        Point = require('./Point'),
        Food = require('./Food'),
        Matrix = require('./Matrix');


    var statics = {
        STATUS_PLAYING: 'playing',
        STATUS_PAUSED: 'paused'
    };

    var Game = GameObject.extend({

        _settings: {
            speed: 50,
            foodMax: 1,
            width: 100,
            height: 100
        },

        _state: {
            status: statics.STATUS_PAUSED,
            players: [],
            obstacles: [],
            food: [],
            matrix: null
        },

        _timer: null,

        _playerQueue: null,

        initialize: function (options) {
            this._settings = _.extend({},
                this._settings,
                _.pick(options || {}, _.keys(this._settings))
            );
            if (this._settings.width < 1 ||this._settings.height < 1) {
                throw new Error('Game width or height cannot be zero');
            }
            this._playerQueue = [];
            this._state.matrix = new Matrix(this._settings.width, this._settings.height);
        },

        start: function () {
            if (this._state.status === statics.STATUS_PLAYING) {
                return;
            }
            this._state.status = statics.STATUS_PLAYING;
            this.trigger('start', this);
            this.tick();
        },

        pause: function () {
            if (this._state.status === statics.STATUS_PAUSED) {
                return;
            }
            this._state.status = statics.STATUS_PAUSED;
            this.trigger('pause', this);
        },

        isRunning: function () {
            return this._state.status === statics.STATUS_PLAYING;
        },

        setSpeed: function (speed) {
            this._settings.speed = speed;
        },

        getSpeed: function () {
            return this._settings.speed;
        },

        addPlayer: function (player) {
            var duplicatePlayer = _.find(_.union(this._state.players, this._playerQueue), function (existingPlayer) {
                return existingPlayer.getName() === player.getName();
            }, this);

            if (!_.isUndefined(duplicatePlayer)) {
                throw new Error('Player name is already in use');
            }
            this._playerQueue.push(player);
        },

        getPlayer: function (name) {
            return _.find(this.getPlayers(), function (player) {
                return player.getName() === name;
            });
        },

        removePlayer: function (name) {
            var player = this.getPlayer(name),
                playerIndex = _.indexOf(this._state.players, player);
            if (playerIndex >= 0) {
                this._state.players.splice(playerIndex, 1);
            }
        },

        getPlayers: function () {
            return this._state.players;
        },

        getFood: function () {
            return this._state.food;
        },

        getPlayerQueue: function () {
            return this._playerQueue;
        },

        getRandomSpawnLocation: function () {
            return this._state.matrix.getNextEmptyCellFromPoint(
                Point.random(this._state.matrix.width() - 1, this._state.matrix.height() - 1)
            );
        },

        /**
         * This is the main game loop. The following tasks are carried out:
         *   - Spawn food
         *   - Move any existing players
         *   - Check player is in bounds - remove if not
         *   - Check collisions and remove collided players
         *   - Place food if required
         *   - Place any new players (check if position is empty to determine if new?)
         *   - Update the raw game matrix
         *   - Schedule the next tick if we are still playing
         *
         */
        tick: function () {
            var removePlayers = [];

            // Place food
            this._spawnFood();

            // Move players
            _.each(this._state.players, function (player) {
                player.move();
            });

            // Process collisions
            _.each(this._state.players, function (player) {

                // Out of bounds of game
                if (!this._state.matrix.isInBounds(player.getPosition())) {
                    removePlayers.push(player.getName());
                    return;
                }

                // TODO: Self collisions

                // Collisions with ther players
                _.each(this._state.players, function (otherPlayer) {
                    var collision;
                    if (player === otherPlayer) {
                        return;
                    }
                    if ((collision = player.collides(otherPlayer)) !== false) {
                        _.each([player, otherPlayer], function (collisionPlayer) {
                            if (collision.equals(collisionPlayer.getPosition())) {
                                removePlayers.push(collisionPlayer.getName());
                            }
                        }, this);
                    }
                }, this);

                // TODO: Obstacles

                // Collisions with food - nom nom nom
                _.each(this._state.food, function (food, index) {
                    if (player.collides(food) && !_.contains(removePlayers, player.getName())) {
                        player.eat(food);
                        this._state.food.splice(index, 1);
                    }
                }, this);

            }, this);

            _.each(removePlayers, this.removePlayer, this);

            this._flushPlayerQueue();
            this._updateMatrix();

            this.trigger('tick', this);

            if (this.getPlayers().length === 0) {
                this.trigger('gameover', this);
                this.pause();
            }

            // Continue the game if still playing - nasty bind and what not here
            if (this.isRunning()) {
                this._timer = setTimeout(_.bind(function () {
                    this.tick();
                }, this), this.getSpeed());
            }
        },

        _spawnFood: function () {
            while (this._state.food.length < this._settings.foodMax) {
                var position = this.getRandomSpawnLocation();
                this._state.food.push(new Food(position.getX(), position.getY(), 1, 10));
            }
        },

        _flushPlayerQueue: function () {
            _.each(this._playerQueue, function (newPlayer) {
                if (newPlayer.getPosition() === null) {
                    newPlayer.setPosition(this.getRandomSpawnLocation());
                }
                if (newPlayer.getDirection() === null) {
                    newPlayer.setRandomDirection();
                }
                this._state.players.push(newPlayer);
            }, this);
            this._playerQueue = [];
        },

        _updateMatrix: function () {
            var displayObjects = _.union(this._state.players, this._state.food, this._state.obstacles);
            this._state.matrix.initialize(this._settings.width, this._settings.height);
            _.each(displayObjects, function (object) {
                _.each(object.getCollisionPoints(), function (point) {
                    this._state.matrix.set(point.getX(), point.getY(), object.getId());
                }, this);
            }, this);
        },

        _serialize: function (state) {
            return _.extend(state, _.clone(this._settings));
        }
    });

    return Game;

}());