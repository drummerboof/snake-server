module.exports = (function Player() {

    var _ = require('lodash'),
        DisplayObject = require('./DisplayObject'),
        Point = require('./Point'),
        PowerUpManager = require('./powerup/Manager'),
        GameObject = require('./GameObject');

    var statics = {
        DIRECTIONS: {
            NORTH: 'north',
            SOUTH: 'south',
            EAST:  'east',
            WEST:  'west'
        }
    };

    statics.BANNED_MOVES = {};
    statics.BANNED_MOVES[statics.DIRECTIONS.NORTH] = [statics.DIRECTIONS.SOUTH];
    statics.BANNED_MOVES[statics.DIRECTIONS.EAST] = [statics.DIRECTIONS.WEST];
    statics.BANNED_MOVES[statics.DIRECTIONS.SOUTH] = [statics.DIRECTIONS.NORTH];
    statics.BANNED_MOVES[statics.DIRECTIONS.WEST] = [statics.DIRECTIONS.EAST];

    var Player = DisplayObject.extend({

        _identifier: 'player',

        _defaultProperties: [
            'direction',
            'pendingMove',
            'length',
            'speed',
            'alive',
            'score',
            'body'
        ],

        _state: {
            name: null,
            direction: null,
            pendingMove: false,
            speed: 0.5,
            length: 5,
            alive: true,
            score: 0,
            body: []
        },

        _cumulativeDistancePerMove: 0,

        _powerUpManager: null,

        initialize: function (name, options) {
            options = options || {};
            if (_.isUndefined(name) || name  === '' || !_.isString(name)) {
                throw new Error('Player name must be defined');
            }
            this._state.name = name;

            this._state = _.extend({},
                this._state,
                _.pick(options || {}, ['length', 'speed'])
            );

            this._powerUpManager = new PowerUpManager(this);
            this.reset();
        },

        reset: function () {
            Player.__super__.reset.apply(this);
            this.getPowerUpManager().clear();
            this._state.body = [new Point(0, 0)];
        },

        getCollisionPointId: function (index) {
            var labels = [this._identifier],
                id = this.getName();

            if (index === 0) {
                labels.push('head');
            }
            labels = _.union(labels, _.map(this._powerUpManager.getPowerUps(), function (powerUp) {
                return powerUp.getId()
            }));
            return labels.join(':') + '#' + id;
        },

        getName: function () {
            return this._state.name;
        },

        getLength: function () {
            return this._state.length;
        },

        getSpeed: function () {
            return this._state.speed;
        },

        getDirection: function () {
            return this._state.direction;
        },

        getScore: function () {
            return this._state.score;
        },

        kill: function () {
            this._powerUpManager.clear();
            this._state.alive = false;
        },

        revive: function () {
            this._state.alive = true;
        },

        isAlive: function () {
            return this._state.alive;
        },

        shouldRender: function () {
            return this.isAlive();
        },

        isPendingMove: function () {
            return this._state.pendingMove;
        },

        setDirection: function (direction) {
            if (!_.contains(statics.DIRECTIONS, direction)) {
                throw new Error('Invalid direction');
            }
            if (!_.contains(statics.BANNED_MOVES[this.getDirection()], direction)) {
                this._state.direction = direction;
                this._state.pendingMove = true;
            }
        },

        setSpeed: function (speed) {
            speed = speed > 1 ? 1 : speed < 0 ? 0 : speed;
            this._state.speed = speed;
        },

        setRandomDirection: function () {
            this.setDirection(_.shuffle(_.values(statics.DIRECTIONS))[0]);
        },

        getBodyRelativeToHead: function () {
            return this._state.body;
        },

        getBodyRelativeToPosition: function () {
            if (this.getPosition() === null) {
                throw new Error('Cannot get body relative to position without a position');
            }
            var relativeBody = [];
            _.each(this._state.body, function (segment) {
                relativeBody.push(segment.add(this.getPosition()));
            }, this);
            return relativeBody;
        },

        getPowerUpManager: function () {
            return this._powerUpManager;
        },

        move: function () {
            if (this.getDirection() === null || this.getPosition() === null) {
                throw new Error('Cannot move without a direction and position');
            }
            var vector = new Point(0, 0),
                initialDistance = this._powerUpManager.hook('modifySpeed', this._state.speed),
                cumulativeDistance = this._cumulativeDistancePerMove + initialDistance,
                roundedCumulativeDistance = Math.floor(cumulativeDistance);

            this._cumulativeDistancePerMove = cumulativeDistance;

            switch (this.getDirection()) {
                case statics.DIRECTIONS.NORTH:
                    vector.setY(-1);
                    break;
                case statics.DIRECTIONS.SOUTH:
                    vector.setY(1);
                    break;
                case statics.DIRECTIONS.EAST:
                    vector.setX(1);
                    break;
                case statics.DIRECTIONS.WEST:
                    vector.setX(-1);
                    break;
            }

            for (var i = 0; i < roundedCumulativeDistance; i++) {
                this.setPosition(this.getPosition().add(vector));
                _.each(this._state.body, function (point, index) {
                    this._state.body[index] = point.add(vector.invert());
                }, this);
                this._state.body.unshift(new Point(0, 0));
            }

            while (this._state.body.length > this._state.length) {
                this._state.body.pop();
            }

            if (this._cumulativeDistancePerMove >= 1) {
                this._cumulativeDistancePerMove = this._cumulativeDistancePerMove - 1;
            }

            if (roundedCumulativeDistance > 0) {
                this._state.pendingMove = false;
            }
        },

        collides: function (displayObject) {
            var collides = Player.__super__.collides.apply(this, arguments);
            return this._powerUpManager.hook('modifyCollides', collides, displayObject);
        },

        selfCollides: function () {
            var collides = Player.__super__.selfCollides.apply(this, arguments);
            return this._powerUpManager.hook('modifySelfCollides', collides);
        },

        eat: function (food) {
            this._state.length += this._powerUpManager.hook('modifyFoodLength', food.getValue());
            this._state.score += this._powerUpManager.hook('modifyFoodPoints', food.getPoints());
        },

        consume: function (powerUp) {
            this._powerUpManager.add(powerUp);
        },

        getCollisionPoints: function () {
            var points = !!this.getPosition() ? this.getBodyRelativeToPosition() : [];
            return this._powerUpManager.hook('modifyCollisionPoints', points);
        },

        _serialize: function (state) {
            state = Player.__super__._serialize.apply(this, arguments);
            state.powerUps = this._powerUpManager.getPowerUps();
            return state;
        }

    }, statics);

    return Player;

}());