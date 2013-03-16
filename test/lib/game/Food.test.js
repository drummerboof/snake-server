describe('Food', function () {

    var _ = require('lodash'),
        Food = require('../../../lib/game/Food'),
        Point = require('../../../lib/game/Point');

    describe('#Food()', function () {

        it('should throw an exception if not given correct parameters', function () {
            (function () { new Food(); }).should.throw('Value for x must be numeric');
            (function () { new Food(0, 0); }).should.not.throw();
        });

        it('should set the value if provided', function () {
            var food = new Food(0, 0, 2);
            food.getValue().should.eql(2);
        });
    });

    describe('#setValue()', function () {

        it('should throw an exception if not given a numeric value', function () {
            var food = new Food(0, 0);
            (function () { food.setValue('blah'); }).should.throw('Value must be numeric');
        });

        it('should set the value for the Food', function () {
            var food = new Food(0, 0);
            food.setValue(5);
            food.getValue().should.eql(5);
        });
    });

});