describe('Point', function () {

    var _ = require('lodash'),
        Point = require('../../src/game/Point');

    describe('#Point()', function () {

        it('should throw an exception if not given a numeric x and y value on construct', function () {
            (function () { new Point(); }).should.throw('Value for x must be numeric');
            (function () { new Point(0, 0); }).should.not.throw();
        });
    });

    describe('#setX()', function () {

        it('should throw an exception if not given a numeric value', function () {
            var point = new Point(0, 0);
            (function () { point.setX('blah'); }).should.throw('Value for x must be numeric');
        });

        it('should set the x value for the point', function () {
            var point = new Point(0, 0);
            point.setX(5);
            point.getX().should.eql(5);
            point.getY().should.eql(0);
        });
    });

    describe('#setY()', function () {

        it('should throw an exception if not given a numeric value', function () {
            var point = new Point(0, 0);
            (function () { point.setY('blah'); }).should.throw('Value for y must be numeric');
        });

        it('should set the y value for the point', function () {
            var point = new Point(0, 0);
            point.setY(5);
            point.getY().should.eql(5);
            point.getX().should.eql(0);
        });
    });


    describe('#set()', function () {

        it('should throw an exception if not given numeric values', function () {
            var point = new Point(0, 0);
            (function () { point.set('blah', false); }).should.throw('Value for x must be numeric');
        });

        it('should set the x and y values for the point', function () {
            var point = new Point(0, 0);
            point.set(5, 4);
            point.getX().should.eql(5);
            point.getY().should.eql(4);
        });
    });

    describe('#equals()', function () {

        it('should return true if the points are the same and false otherwise', function () {
            var point = new Point(1, 2)
            point.equals(new Point(1, 2)).should.be.true;
            point.equals(new Point(2, 1)).should.be.false;
        });

    });

    describe('#add()', function () {

        it('should add the given point to the current point and return the resulting point', function () {
            var point = new Point(1, 2),
                result = point.add(new Point(2, 3));

            result.getX().should.eql(3);
            result.getY().should.eql(5);
        });

    });

    describe('#subtract()', function () {

        it('should subtract the given point from the current point and return the resulting point', function () {
            var point = new Point(10, 10),
                result = point.subtract(new Point(2, 3));

            result.getX().should.eql(8);
            result.getY().should.eql(7);
        });

    });

    describe('#invert()', function () {

        it('should return a new point with the signs of each component inverted', function () {
            var point = new Point(0, 0),
                provider = [
                    {
                        fixture: [0, 0],
                        expected: new Point(0, 0)
                    },
                    {
                        fixture: [5, 6],
                        expected: new Point(-5, -6)
                    },
                    {
                        fixture: [-4, -10],
                        expected: new Point(4, 10)
                    }
                ];

            _.each(provider, function (data) {
                point.set.apply(point, data.fixture);
                point.invert().should.eql(data.expected);
            }, this);
        });

    });

    describe('#Point.random()', function () {

        it('should create a random point with co-ordinates between 0 and the specified max values', function () {
            var point = Point.random(10, 5);
            point.should.be.an.instanceOf(Point);
            (point.getX() <= 10).should.be.true;
            (point.getY() <= 5).should.be.true;
        })
    });
});