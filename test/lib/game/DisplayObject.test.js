describe('DisplayObject', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        DisplayObject = require('../../../lib/game/DisplayObject'),
        Point = require('../../../lib/game/Point');

    describe('#DisplayObject()', function () {

    });

    describe('#serialize()', function () {

        it('should include the point and identifier in the state information', function () {
            var SubDisplayObject = DisplayObject.extend({
                    _identifier: 'test',
                    _state: {
                        key: 'value'
                    }
                }),
                displayObject = new SubDisplayObject();

            displayObject.setPosition(4, 5);
            displayObject.serialize().should.eql({
                key: 'value',
                id: 'test',
                position: { x: 4, y: 5 }
            });
        });
    });

    describe('#getCollisionPointId()', function () {

        it('should return the ID string for the type', function () {
            var SubDisplayObject = DisplayObject.extend({
                    _identifier: 'bob'
                }),
                subObject = new SubDisplayObject();

            subObject.getCollisionPointId().should.eql('bob');
        });
    });

    describe('#shouldRender()', function () {

        it('should return true', function () {
            var displayObject = new DisplayObject();
            displayObject.shouldRender().should.be.true;
        });
    });

    describe('#setPosition()', function () {

        it('should throw an error if called with no arguments', function () {
            var displayObject = new DisplayObject();
            (function () { displayObject.setPosition(); }).should.throw('Must specify a position');
        });

        it('should set the position of the display object using a point value', function () {
            var displayObject = new DisplayObject();
            displayObject.setPosition(new Point(3, 4));
            displayObject.getPosition().should.eql(new Point(3, 4));
        });

        it('should set the position of the display object using individual co-ordinates', function () {
            var displayObject = new DisplayObject();
            displayObject.setPosition(1, 2);
            displayObject.getPosition().should.eql(new Point(1, 2));
        });
    });

    describe('#getCollisionPoints()', function () {

        it('should return an array of all collision points for the display object', function () {
            var displayObject = new DisplayObject();
            displayObject.setPosition(5, 6);
            displayObject.getCollisionPoints().should.eql([
                new Point(5, 6)
            ]);
        });
    });

    describe('selfCollides()', function () {

        it('should return the point at which any the display points are overlapping, or false', function () {
            var displayObject = new DisplayObject(),
                getCollisionPointsStub = sinon.stub(displayObject, 'getCollisionPoints'),
                provider = [{
                    fixture: [new Point(1, 1)],
                    expected: false
                }, {
                    fixture: [new Point(1, 2), new Point(1, 0), new Point(1, 2)],
                    expected: new Point(1, 2)
                }];

            _.each(provider, function (data) {
                getCollisionPointsStub.returns(data.fixture);
                displayObject.selfCollides().should.eql(data.expected);
            }, this);
        });
    });

    describe('#collides()', function () {

        it('should return the collision point between two display objects if there was one or false if not', function () {
            var displayObject1 = new DisplayObject(),
                displayObject2 = new DisplayObject(),
                provider = [
                    {
                        fixture: {
                            position1: [2, 2],
                            position2: [2, 2],
                            collisionPoints1: [new Point(2, 2)],
                            collisionPoints2: [new Point(2, 2)]
                        },
                        expected: new Point(2, 2)
                    },
                    {
                        fixture: {
                            position1: [2, 2],
                            position2: [4, 4],
                            collisionPoints1: [
                                new Point(2, 2),
                                new Point(2, 3),
                                new Point(3, 3),
                                new Point(3, 4),
                                new Point(4, 4)
                            ],
                            collisionPoints2: [new Point(4, 4)]
                        },
                        expected: new Point(4, 4)
                    },
                    {
                        fixture: {
                            position1: [6, 7],
                            position2: [4, 4],
                            collisionPoints1: [
                                new Point(6, 7),
                                new Point(5, 7),
                                new Point(5, 6),
                                new Point(5, 5)
                            ],
                            collisionPoints2: [
                                new Point(4, 4),
                                new Point(4, 5),
                                new Point(5, 5),
                                new Point(6, 5),
                                new Point(6, 6)
                            ]
                        },
                        expected: new Point(5, 5)
                    },
                    {
                        fixture: {
                            position1: [6, 7],
                            position2: [4, 4],
                            collisionPoints1: [
                                new Point(6, 7),
                                new Point(5, 7),
                                new Point(5, 6),
                                new Point(5, 5)
                            ],
                            collisionPoints2: [
                                new Point(4, 4),
                                new Point(4, 3),
                                new Point(4, 2),
                                new Point(3, 2),
                                new Point(2, 2)
                            ]
                        },
                        expected: false
                    }
                ],
                collisionPointsStub1 = sinon.stub(displayObject1, 'getCollisionPoints'),
                collisionPointsStub2 = sinon.stub(displayObject2, 'getCollisionPoints');

            _.each(provider, function (data) {

                displayObject1.setPosition(data.fixture.position1[0], data.fixture.position1[1]);
                displayObject2.setPosition(data.fixture.position2[0], data.fixture.position2[1]);
                collisionPointsStub1.returns(data.fixture.collisionPoints1);
                collisionPointsStub2.returns(data.fixture.collisionPoints2);

                displayObject1.collides(displayObject2).should.eql(data.expected);

            }, this);

        });
    });

});