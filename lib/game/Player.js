module.exports = (function Player() {

    var _ = require('lodash'),
        DisplayObject = require('./DisplayObject'),
        Point = require('./Point'),
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
            'alive',
            'score'
        ],

        _state: {
            name: null,
            direction: null,
            pendingMove: false,
            length: 5,
            alive: true,
            score: 0,
            body: []
        },

        initialize: function (name, length) {
            if (_.isUndefined(name) || name  === '' || !_.isString(name)) {
                throw new Error('Player name must be defined');
            }
            this._state.name = name;
            if (_.isNumber(length)) {
                this._state.length = length;
            }
            this.reset();
        },

        reset: function () {
            Player.__super__.reset.apply(this);
            this._position = null;
            this._state.body = [new Point(0, 0)];
        },

        getCollisionPointId: function (index) {
            var id = this._identifier;
            if (index === 0) {
                id += ':head';
            }
            id += '#' + this.getName();
            return id;
        },

        getName: function () {
            return this._state.name;
        },

        getLength: function () {
            return this._state.length;
        },

        getDirection: function () {
            return this._state.direction;
        },

        getScore: function () {
            return this._state.score;
        },

        kill: function () {
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

        move: function () {
            if (this.getDirection() === null || this.getPosition() === null) {
                throw new Error('Cannot move without a direction and position');
            }
            var vector = new Point(0, 0);
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

            this.setPosition(this.getPosition().add(vector));

            _.each(this._state.body, function (point, index) {
                this._state.body[index] = point.add(vector.invert());
            }, this);

            this._state.body.unshift(new Point(0, 0));

            if (this._state.body.length > this._state.length) {
                this._state.body.pop();
            }
            this._state.pendingMove = false;
        },

        eat: function (food) {
            this._state.length += food.getValue();
            this._state.score += food.getPoints();
        },

        getCollisionPoints: function () {
            return this.getBodyRelativeToPosition();
        }

    }, statics);

    return Player;

}());