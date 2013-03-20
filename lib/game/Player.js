module.exports = (function Player() {

    var _ = require('lodash'),
        DisplayObject = require('./DisplayObject'),
        Point = require('./Point');

    var statics = {
        DIRECTIONS: {
            NORTH: 'north',
            SOUTH: 'south',
            EAST:  'east',
            WEST:  'west'
        }
    };

    var Player = DisplayObject.extend({

        _identifier: 'player',

        _state: {
            name: null,
            direction: null,
            length: 5,
            position: null,
            alive: true,
            body: []
        },

        _bannedMoves: {},

        initialize: function (name, length) {
            if (_.isUndefined(name) || !_.isString(name)) {
                throw new Error('Player name must be defined');
            }
            this._state.name = name;
            if (_.isNumber(length)) {
                this._state.length = length;
            }
            this._state.body.push(new Point(0, 0));
            this._bannedMoves[statics.DIRECTIONS.NORTH] = [statics.DIRECTIONS.SOUTH];
            this._bannedMoves[statics.DIRECTIONS.EAST] = [statics.DIRECTIONS.WEST];
            this._bannedMoves[statics.DIRECTIONS.SOUTH] = [statics.DIRECTIONS.NORTH];
            this._bannedMoves[statics.DIRECTIONS.WEST] = [statics.DIRECTIONS.EAST];
        },

        getId: function () {
            return this._identifier + ':' + this.getName();
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

        kill: function () {
            this._state.alive = false;
        },

        revive: function () {
            this._state.alive = true;
        },

        isAlive: function () {
            return this._state.alive;
        },

        setDirection: function (direction) {
            if (!_.contains(statics.DIRECTIONS, direction)) {
                throw new Error('Invalid direction');
            }
            if (!_.contains(this._bannedMoves[this.getDirection()], direction)) {
                this._state.direction = direction;
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
            if (this.getDirection() === null) {
                throw new Error('Cannot move without a direction');
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
        },

        eat: function (value) {
            value = _.isUndefined(value) ? 1 : value;
            this._state.length += value;
        },

        getCollisionPoints: function () {
            return this.getBodyRelativeToPosition();
        }

    }, statics);

    return Player;

}());