describe('Matrix', function () {

    var _ = require('lodash'),
        Matrix = require('../../src/game/Matrix'),
        Point = require('../../src/game/Point');

    describe('#Matrix()', function () {

        it('should initialize an empty matric of the given dimensions', function () {
            var matrix = new Matrix(7, 5);
            (matrix.get(0, 0) === null).should.be.true;
            (matrix.get(6, 4) === null).should.be.true;
        });
    });

    describe('#set()', function () {

        it('should throw an exception if the co-ordinates are out of bounds', function () {
            var matrix = new Matrix(7, 5);
            (function () { matrix.set(7, 7, 'test'); }).should.throw('Co-ordinates are out of bounds');
            (function () { matrix.set(9, 4, 'test'); }).should.throw('Co-ordinates are out of bounds');
            (function () { matrix.set(4, -1, 'test'); }).should.throw('Co-ordinates are out of bounds');
            (function () { matrix.set(-1, 2, 'test'); }).should.throw('Co-ordinates are out of bounds');
        });

        it('should set the value at the given co-ordinates', function () {
            var matrix = new Matrix(7, 5);
            (matrix.get(6, 4) ===null).should.be.true;
            matrix.set(6, 4, 'test');
            matrix.get(6, 4).should.equal('test');
        });
    });

    describe('#clear()', function () {

        it('should set the element at the given co-ordinate to null', function () {
            var matrix = new Matrix(7, 5);
            matrix.set(6, 4, 'test');
            matrix.get(6, 4).should.equal('test');
            matrix.clear(6, 4);
            (matrix.get(6, 4) ===null).should.be.true;
        });
    });

    describe('#isInBounds()', function () {

        it('should return true if the piont is in bounds and false otherwise', function () {
            var matrix = new Matrix(3, 3),
                provider = [{
                    point: new Point(0, 0),
                    expected: true
                }, {
                    point: new Point(2, 2),
                    expected: true
                }, {
                    point: new Point(4, -1),
                    expected: false
                }];

            _.each(provider, function (data) {
                matrix.isInBounds(data.point).should.equal(data.expected);
            }, this);
        });
    });

    describe('#reset()', function () {

        it('should clear out the matrix', function () {
            var matrix = new Matrix(3, 3);
            matrix.set(0, 0, true);
            matrix.set(1, 2, true);

            matrix.reset();

            (matrix.get(0, 0) ===null).should.be.true;
            (matrix.get(1, 2) ===null).should.be.true;
            matrix.width().should.eql(3);
            matrix.height().should.eql(3);
        });
    });

    describe('#getNextEmptyCellFromPoint()', function () {

        it('should return the next empty cell position from the point given working east -> west, north -> south', function () {
            var matrix = new Matrix(3, 3),
                provider = [{
                    fixture: {
                        point: new Point(0, 1),
                        populateCells: [
                            [0, 1, true],
                            [0, 2, true],
                            [1, 0, true]
                        ]
                    },
                    expected: new Point(1, 1)
                }, {
                    fixture: {
                        point: new Point(0, 1),
                        populateCells: [
                            [0, 2, true],
                            [1, 0, true]
                        ]
                    },
                    expected: new Point(0, 1)
                }, {
                    fixture: {
                        point: new Point(1, 1),
                        populateCells: [
                            [1, 1, true],
                            [2, 1, true],
                            [0, 2, true],
                            [1, 2, true],
                            [2, 2, true]
                        ]
                    },
                    expected: new Point(0, 0)
                }];

            _.each(provider, function (data) {
                matrix.reset();
                _.each(data.fixture.populateCells, function (cell) {
                    matrix.set.apply(matrix, cell);
                }, this);
                matrix.getNextEmptyCellFromPoint(data.fixture.point).should.eql(data.expected);
            }, this);
            matrix.set(0, 1, true);
            matrix.set(0, 2, true);
            matrix.set(1, 0, true);

        });
    });

    describe('#getPointQuadrant()', function () {

        it('should throw an exception if given a point which is out of bounds', function () {

        });

        it('should return the quadrant number in which the given point lies', function () {
            var matrix = new Matrix(5, 5),
                provider = [{
                    point: new Point(1, 1),
                    expected: 'northwest'
                }, {
                    point: new Point(1, 3),
                    expected: 'southwest'
                }, {
                    point: new Point(3, 1),
                    expected: 'northeast'
                }, {
                    point: new Point(3, 3),
                    expected: 'southeast'
                }, {
                    point: new Point(2, 2),
                    expected: 'southeast'
                }];

            _.each(provider, function (data) {
                matrix.getPointQuadrant(data.point).should.eql(data.expected);
            }, this);
        });
    });

    describe('#serialize()', function () {

        it('should return the raw matrix data', function () {
            var matrix = new Matrix(3, 3),
                expected = [
                    [1, null, null],
                    [null, 2, null],
                    [null, null, 3]
                ];

            matrix.set(0, 0, 1);
            matrix.set(1, 1, 2);
            matrix.set(2, 2, 3);

            matrix.serialize().should.eql(expected);

        });
    });

});