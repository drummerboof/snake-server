describe('Loader', function () {

    describe('require', function () {

        it('should include all the game classes name-spaced accordingly', function () {
            var Snake = require('../index');

            (new Snake.GameObject()).should.be.an.instanceof(Snake.GameObject);
            (new Snake.DisplayObject()).should.be.an.instanceof(Snake.DisplayObject);

            (new Snake.Game({})).should.be.an.instanceof(Snake.Game);
            (new Snake.GameServer({}, '')).should.be.an.instanceof(Snake.GameServer);

            (new Snake.Player('test')).should.be.an.instanceof(Snake.Player);
            (new Snake.Food(0, 0, 0, 0)).should.be.an.instanceof(Snake.Food);
            (new Snake.Matrix(10, 10)).should.be.an.instanceof(Snake.Matrix);
            (new Snake.Point(0, 0)).should.be.an.instanceof(Snake.Point);

            (new Snake.PowerUp.Manager(null)).should.be.an.instanceof(Snake.PowerUp.Manager);
            (new Snake.PowerUp.FoodLengthMultiplier()).should.be.an.instanceof(Snake.PowerUp.FoodLengthMultiplier);
            (new Snake.PowerUp.FoodPointMultiplier()).should.be.an.instanceof(Snake.PowerUp.FoodPointMultiplier);
            (new Snake.PowerUp.SpeedMultiplier()).should.be.an.instanceof(Snake.PowerUp.SpeedMultiplier);
            (new Snake.PowerUp.Invincible()).should.be.an.instanceof(Snake.PowerUp.Invincible);
        });
    });
});