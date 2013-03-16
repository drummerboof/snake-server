describe('GameObject', function () {

    var sinon = require('sinon'),
        GameObject = require('../../../lib/game/GameObject'),
        GameObjectSubClass1,
        GameObjectSubClass2;

    beforeEach(function () {
        GameObjectSubClass2 = GameObject.extend({
            _state: {
                prop1: 'value1'
            },
            _serialize: function (state) {
                state.prop2 = 'value2';
                return state;
            }
        }),
        GameObjectSubClass1 = GameObject.extend({
            _state: {
                prop3: 'value3',
                child: null,
                children: []
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