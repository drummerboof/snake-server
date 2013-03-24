module.exports = (function Game() {

    var _ = require('lodash'),
        GameObject = require('./GameObject'),
        Point = require('./Point'),
        Food = require('./Food'),
        Matrix = require('./Matrix');


    var statics = {
        STATUS_PLAYING: 'playing',
        STATUS_PAUSED: 'paused',
        STATUS_OVER: 'over'
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
            this.reset();
            this._playerQueue = [];
        },

        reset: function () {
            console.log('resetting game');
            this.pause();
            _.each(this.getPlayers(), function(player) {
                player.reset();
                this._playerQueue.push(player);
            }, this);
            this._state.players = [];
            this._state.food = [];
            this._state.obstacles = [];
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
            console.log('pausing game');
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

        queuePlayer: function (player) {
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
            this._state.players = _.reject(this._state.players, function (player) {
                return player.getName() === name;
            });
            this._playerQueue = _.reject(this._playerQueue, function (player) {
                return player.getName() === name;
            });
        },

        respawnPlayer: function (name) {
            var player = this.getPlayer(name);
            if (_.isUndefined(player) || player.isAlive()) {
                throw new Error('Player must exist and be dead to be respawned');
            }
            player.reset();
            player.setRandomDirection();
            player.setPosition(this.getRandomSpawnLocation());
        },

        flushPlayerQueue: function () {
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

        getPlayers: function () {
            return this._state.players;
        },

        getLivingPlayers: function () {
            return _.filter(this._state.players, function (player) {
                return player.isAlive();
            });
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

        spawnFood: function () {
            while (this._state.food.length < this._settings.foodMax) {
                var position = this.getRandomSpawnLocation();
                this._state.food.push(new Food(position.getX(), position.getY(), 1, 10));
            }
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
         */
        tick: function () {
            // Get remaining living players
            var livingPlayers = this.getLivingPlayers();

            // Place food
            this.spawnFood();

            // Move players
            _.each(livingPlayers, function (player) {
                player.move();
            });

            // Process collisions
            _.each(livingPlayers, function (player) {

                // Slef collisions or out of bounds of game
                if (player.selfCollides() ||!this._state.matrix.isInBounds(player.getPosition())) {
                    player.kill();
                    return;
                }

                // Collisions with ther players
                _.each(livingPlayers, function (otherPlayer) {
                    var collision;
                    if (player === otherPlayer) {
                        return;
                    }
                    if ((collision = player.collides(otherPlayer)) !== false) {
                        _.each([player, otherPlayer], function (collisionPlayer) {
                            if (collision.equals(collisionPlayer.getPosition())) {
                                collisionPlayer.kill();
                            }
                        }, this);
                    }
                }, this);

                // TODO: Obstacles

                // Collisions with food - nom nom nom
                this._state.food = _.reject(this._state.food, function (food) {
                    if (player.collides(food) && player.isAlive()) {
                        player.eat(food);
                        return true;
                    }
                    return false;
                }, this);

            }, this);

            this.flushPlayerQueue();
            this._updateMatrix();

            this.trigger('tick', this);

            if (this.getLivingPlayers().length === 0) {
                this._state.status = statics.STATUS_OVER;
                this.trigger('gameover', this);
            }

            // Continue the game if still playing
            if (this.isRunning()) {
                this._timer = setTimeout(_.bind(function () {
                    this.tick();
                }, this), this.getSpeed());
            }
        },

        _updateMatrix: function () {
            var displayObjects = _.union(this._state.players, this._state.food, this._state.obstacles);
            this._state.matrix.initialize(this._settings.width, this._settings.height);
            _.each(displayObjects, function (object) {
                if (object.shouldRender()) {
                    _.each(object.getCollisionPoints(), function (point) {
                        this._state.matrix.set(point.getX(), point.getY(), object.getId());
                    }, this);
                }
            }, this);
        },

        _serialize: function (state) {
            return _.extend(state, _.clone(this._settings), {
                players: _.union(_.clone(state.players), this._playerQueue)
            });
        }
    });

    return Game;

}());