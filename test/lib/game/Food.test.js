describe('Food', function () {

    var _ = require('lodash'),
        Food = require('../../../lib/game/Food'),
        Point = require('../../../lib/game/Point');

    describe('#Food()', function () {

        it('should throw an exception if not given correct parameters', function () {
            (function () { new Food(); }).should.throw('Value for x must be numeric');
            (function () { new Food(0, 0); }).should.not.throw();
        });

        it('should set the value and points if provided', function () {
            var food = new Food(0, 0, 2, 4);
            food.getValue().should.eql(2);
            food.getPoints().should.eql(4);
        });
    });

});