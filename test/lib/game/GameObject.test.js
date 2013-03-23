describe('GameObject', function () {

    var sinon = require('sinon'),
        GameObject = require('../../../lib/game/GameObject'),
        GameObjectSubClass1,
        GameObjectSubClass3,
        GameObjectSubClass2;

    beforeEach(function () {
        GameObjectSubClass1 = GameObject.extend({
            _state: {
                prop3: 'value3',
                child: null,
                children: []
            }
        });
        GameObjectSubClass2 = GameObject.extend({
            _state: {
                prop1: 'value1'
            },
            _serialize: function (state) {
                state.prop2 = 'value2';
                return state;
            }
        }),
        GameObjectSubClass3 = GameObject.extend({
            _defaultProperties: ['prop1', 'prop3'],
            _state: {
                prop1: 'value3',
                prop2: true,
                prop3: null
            },
            initialize: function() {
                this._state.prop3 = 'jam';
            }
        });
    });

    describe('#GameObject()', function () {

        it('should clone the object state for each instance', function () {
            var game1 = new GameObjectSubClass1(),
                game2 = new GameObjectSubClass1();
            game1._state.test = 2;
            game1._state.test.should.not.eql(game2._state.test);
        });

        it('should call initialize with any constructor arguments', function () {
            sinon.spy(GameObjectSubClass1.prototype.initialize, 'apply');
            var object = new GameObjectSubClass1(true, false);
            GameObjectSubClass1.prototype.initialize.apply.calledWithExactly(object, true, false);
        });
    });

    describe('#reset()', function () {

        it('should return the state to the defaults if any properties are listed in _defaultProperties', function () {
            var withDefaults = new GameObjectSubClass3(),
                withoutDefaults = new GameObjectSubClass1();

            withDefaults._state.prop1 = 'different';
            withDefaults._state.prop2 = 'something else';
            withDefaults._state.prop3 = 'not original';

            withDefaults.reset();

            withDefaults.serialize().should.eql({
                prop1: 'value3',
                prop2: 'something else',
                prop3: 'jam'
            });

            withoutDefaults._state.prop3 = 'different';
            withoutDefaults._state.child = 'something else';
            withoutDefaults._state.children = ['not original'];

            withoutDefaults.reset();

            withoutDefaults.serialize().should.eql({
                prop3: 'different',
                child: 'something else',
                children: ['not original']
            });
        });
    });

    describe('#serialize()', function () {

        it('should serialize all state properties recursively', function () {
            var expected = {
                    prop3: 'value3',
                    child: {
                        prop1: 'value1',
                        prop2: 'value2',
                        grandchild: {
                            prop1: 'value1',
                            prop2: 'value2'
                        }
                    },
                    children: [{
                        prop1: 'value1',
                        prop2: 'value2'
                    }, {
                        prop1: 'value1',
                        prop2: 'value2'
                    }]
                },
                game = new GameObjectSubClass1(),
                game2 = new GameObjectSubClass2(),
                game3 = new GameObjectSubClass2(),
                game4 = new GameObjectSubClass2(),
                game5 = new GameObjectSubClass2();

            game._state.child = game2,
            game._state.children = [game4, game5];
            game2._state.grandchild = game3
            game.serialize().should.eql(expected);
        });
    });
});