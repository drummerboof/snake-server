module.exports = (function Game() {

    var _ = require('lodash'),
        GameObject = require('./GameObject'),
        Point = require('./Point'),
        Food = require('./Food'),
        Player = require('./Player'),
        Matrix = require('./Matrix');

    var statics = {
        STATUS_PLAYING: 'playing',
        STATUS_PAUSED: 'paused',
        STATUS_OVER: 'over'
    };

    statics.QUADRANT_DIRECTIONS = {};
    statics.QUADRANT_DIRECTIONS[Matrix.QUADRANT_NORTHEAST] = Player.DIRECTIONS.SOUTH;
    statics.QUADRANT_DIRECTIONS[Matrix.QUADRANT_NORTHWEST] = Player.DIRECTIONS.EAST;
    statics.QUADRANT_DIRECTIONS[Matrix.QUADRANT_SOUTHEAST] = Player.DIRECTIONS.WEST;
    statics.QUADRANT_DIRECTIONS[Matrix.QUADRANT_SOUTHWEST] = Player.DIRECTIONS.NORTH;

    statics.POWER_UPS = [
        require('./powerup/Invincible'),
        require('./powerup/FoodPointMultiplier'),
        require('./powerup/FoodLengthMultiplier'),
        require('./powerup/SpeedMultiplier')
    ];

    var Game = GameObject.extend({

        _settings: {
            speed: 50,
            foodMax: 1,
            powerUpMax: 2,
            powerUpChance: 0.5,
            playerDirectionQueueLimit: 2,
            playerSpeed: 0.5,
            width: 100,
            height: 100
        },

        _state: {
            status: statics.STATUS_PAUSED,
            players: [],
            obstacles: [],
            powerUps: [],
            food: []
        },

        _matrix: null,

        _timer: null,

        _playerQueue: null,

        _playerDirectionQueue: null,

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
            this.pause();
            _.each(this.getPlayers(), function(player) {
                player.reset();
                this._playerQueue.push(player);
            }, this);
            this._state.players = [];
            this._state.food = [];
            this._state.obstacles = [];
            this._state.powerUps = [];
            this._playerDirectionQueue = {};
            this._matrix = new Matrix(this._settings.width, this._settings.height);
        },

        start: function () {
            if (this._state.status === statics.STATUS_PLAYING) {
                return;
            }
            this._state.status = statics.STATUS_PLAYING;
            _.each(this._state.players, function (player) {
                player.getPowerUpManager().resume();
            }, this);
            this.trigger('start', this);
            this.tick();
        },

        pause: function () {
            if (this._state.status === statics.STATUS_PAUSED) {
                return;
            }
            this._state.status = statics.STATUS_PAUSED;
            _.each(this._state.players, function (player) {
                player.getPowerUpManager().pause();
            }, this);
            this.trigger('pause', this);
        },

        getMatrix: function () {
            return this._matrix;
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
            player.setSpeed(this._settings.playerSpeed);
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
            var player = this.getPlayer(name),
                quadrant;

            if (_.isUndefined(player) || player.isAlive()) {
                throw new Error('Player must exist and be dead to be respawned');
            }
            player.reset();
            player.setPosition(this.getRandomSpawnLocation());
            quadrant = this._matrix.getPointQuadrant(player.getPosition());
            player.setDirection(statics.QUADRANT_DIRECTIONS[quadrant]);
        },

        flushPlayerQueue: function () {
            _.each(this._playerQueue, function (newPlayer) {
                if (newPlayer.getPosition() === null) {
                    newPlayer.setPosition(this.getRandomSpawnLocation());
                }
                if (newPlayer.getDirection() === null) {
                    var quadrant = this._matrix.getPointQuadrant(newPlayer.getPosition());
                    newPlayer.setDirection(statics.QUADRANT_DIRECTIONS[quadrant]);
                }
                this._state.players.push(newPlayer);
            }, this);
            this._playerQueue = [];
        },

        queuePlayerDirection: function (player, direction) {
            if (_.isUndefined(this.getPlayer(player))) {
                throw new Error('Player cannot be found');
            }
            if (!_.isArray(this._playerDirectionQueue[player])) {
                this._playerDirectionQueue[player]= [];
            }
            if (this._playerDirectionQueue[player].length < this._settings.playerDirectionQueueLimit) {
                this._playerDirectionQueue[player].push(direction);
            }
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

        getPowerUps: function () {
            return this._state.powerUps;
        },

        getPlayerQueue: function () {
            return this._playerQueue;
        },

        getRandomSpawnLocation: function () {
            return this._matrix.getNextEmptyCellFromPoint(
                Point.random(this._matrix.width() - 1, this._matrix.height() - 1)
            );
        },

        getRandomPowerUpConstructor: function () {
            return _.shuffle(statics.POWER_UPS)[0];
        },

        spawnFood: function () {
            while (this._state.food.length < this._settings.foodMax) {
                var position = this.getRandomSpawnLocation();
                this._state.food.push(new Food(position.getX(), position.getY(), 1, 10));
            }
        },

        spawnPowerUp: function () {
            if (this._state.powerUps.length < this._settings.powerUpMax) {
                if (Math.random() <= this._settings.powerUpChance) {
                    var powerUp = new (this.getRandomPowerUpConstructor())();
                    powerUp.setPosition(this.getRandomSpawnLocation());
                    this._state.powerUps.push(powerUp);
                }
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
                if (!player.isPendingMove()) {
                    this._setPlayerNextDirection(player);
                }
                player.move();
            }, this);

            // Process collisions
            _.each(livingPlayers, function (player) {

                // Remove expired powerUps from the player
                player.getPowerUpManager().purgeExpired();

                // Self collisions or out of bounds of game
                if (player.selfCollides() ||!this._matrix.isInBounds(player.getPosition())) {
                    player.kill();
                    return;
                }

                // Collisions with other players
                _.each(livingPlayers, function (otherPlayer) {
                    var collision;
                    if (player !== otherPlayer && otherPlayer.isAlive()) {
                        if ((collision = player.collides(otherPlayer)) !== false) {
                            if (collision.equals(player.getPosition())) {
                                player.kill();
                            }
                            // Check this is a mutual collision to enable invincibility sub
                            if (collision.equals(otherPlayer.getPosition()) && otherPlayer.collides(player)) {
                                otherPlayer.kill();
                            }
                        }
                    }
                }, this);

                // TODO: Obstacles

                // Collisions with food - nom nom nom
                this._state.food = _.reject(this._state.food, function (food) {
                    if (player.isAlive() && player.collides(food)) {
                        player.eat(food);
                        this.spawnPowerUp();
                        return true;
                    }
                    return false;
                }, this);

                // Collisions with powerUps
                this._state.powerUps = _.reject(this._state.powerUps, function (powerUp) {
                    if (player.isAlive() && player.collides(powerUp)) {
                        player.consume(powerUp);
                        return true;
                    }
                    return false;
                }, this);

            }, this);

            this.flushPlayerQueue();
            this._updateMatrix();

            if (this.getLivingPlayers().length === 0) {
                this._state.status = statics.STATUS_OVER;
            }

            this.trigger('tick', this);

            if (this._state.status === statics.STATUS_OVER) {
                this.trigger('gameover', this);
            }

            // Continue the game if still playing
            if (this.isRunning()) {
                this._timer = setTimeout(_.bind(function () {
                    this.tick();
                }, this), this.getSpeed());
            }
        },

        _setPlayerNextDirection: function (player) {
            var playerDirections = this._playerDirectionQueue[player.getName()];
            if (_.isArray(playerDirections) && playerDirections.length > 0) {
                player.setDirection(playerDirections.shift());
            }
        },

        _updateMatrix: function () {
            var displayObjects = _.union(this._state.players, this._state.food, this._state.powerUps);
            this._matrix.initialize(this._settings.width, this._settings.height);
            _.each(displayObjects, function (object) {
                if (object.shouldRender()) {
                    _.each(object.getCollisionPoints(), function (point, index) {
                        this._matrix.set(point.getX(), point.getY(), object.getCollisionPointId(index));
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