describe('Game', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Game = require('../../../lib/game/Game'),
        Player = require('../../../lib/game/Player'),
        Food = require('../../../lib/game/Food'),
        Point = require('../../../lib/game/Point'),
        game;

    beforeEach(function () {
        game = new Game({
            width: 10,
            height: 10
        });
    });

    describe('#Game()', function () {

        it('should throw an exception if the width or height are less than 1', function () {
            (function () { new Game({ width: 0, height: 10}); }).should.throw('Game width or height cannot be zero');
            (function () { new Game({ width: 10, height: 0}); }).should.throw('Game width or height cannot be zero');
        });

        it('should set the settings for the game', function () {
            var game = new Game({
                speed: 200,
                foodMax: 2,
                width: 50,
                height: 60
            });
            game.getSpeed().should.eql(200);
            game.serialize().width.should.eql(50);
            game.serialize().height.should.eql(60);
            game.tick();
            game.getFood().length.should.eql(2);
        });
    });

    describe('#serialize()', function () {

        it('should combine the settings with the state of the game', function () {
            var game = new Game({ width: 3, height: 3 });
            game.serialize().should.eql({
                status: 'paused',
                players: [],
                obstacles: [],
                food: [],
                matrix: [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null]
                ],
                speed: 50,
                foodMax: 1,
                width: 3,
                height: 3
            });
        });
    });

    describe('#setSpeed()', function () {

        it('should set the tick timeout for the game', function () {
            game.setSpeed(50);
            game.getSpeed().should.eql(50);
            game.setSpeed(100);
            game.getSpeed().should.eql(100);
        });
    });

    describe('#getRandomSpawnLocation()', function () {

        it('should return the first empty cell of the game matrix using getNextEmptyCellFromPoint', function () {
            var randomPoint = new Point(2, 2),
                nextFreePoint = new Point(3, 3);
            sinon.stub(Point, 'random').returns(randomPoint);
            sinon.stub(game._state.matrix, 'getNextEmptyCellFromPoint').returns(nextFreePoint);

            var point = game.getRandomSpawnLocation();

            Point.random.callCount.should.eql(1);
            game._state.matrix.getNextEmptyCellFromPoint.calledWithExactly(randomPoint).should.be.true;
            point.should.equal(nextFreePoint);
        });
    });

    describe('#addPlayer()', function () {

        it('should throw an error if adding a player whose name is already taken', function () {
            game.addPlayer(new Player('bob'));
            (function () { game.addPlayer(new Player('bob')); }).should.throw('Player name is already in use');
        });
        it('should add a new player to the player queue', function () {
            var player = new Player('test');
            game.getPlayerQueue().should.be.empty;
            game.addPlayer(player);
            game.getPlayerQueue().length.should.eql(1);
            game.getPlayerQueue()[0].should.eql(player);
        });
    });

    describe('#removePlayer()', function () {

        it('should remove the player from the list of active players', function () {
            var player = new Player('test');
            game._state.players.push(player);
            game.getPlayers().length.should.eql(1);
            game.removePlayer(new Player('bob'));
            game.getPlayers().length.should.eql(1);
            game.removePlayer(player);
            game.getPlayers().length.should.eql(0);
        });
    });

    describe('#start()', function () {

        it('should start the game loop and update the status of the game', function () {
            sinon.stub(game, 'tick');
            game.isRunning().should.be.false;
            game.start();
            game.isRunning().should.be.true;
            game.tick.callCount.should.eql(1);
        });
    });

    describe('#pause()', function () {

        it('should update the status of the game', function () {
            game.start();
            game.pause();
            game.isRunning().should.be.false;
        });
    });

    describe('#tick()', function () {

        function createTestGame() {
            return new Game({
                foodMax: 2,
                width: 5,
                height: 5
            });
        }

        it('should spawn any food if required', function () {
            var game = createTestGame(),
                foodPlaced = 0,
                foodPoints = [
                    new Point(1, 1),
                    new Point(2, 2)
                ];

            sinon.stub(game, 'getRandomSpawnLocation', function () {
                return foodPoints[foodPlaced++];
            });

            game.tick();

            game.getFood()[0].getPosition().should.eql(foodPoints[0]);
            game.getFood()[1].getPosition().should.eql(foodPoints[1]);
        });

        it('should move each player', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            game.addPlayer(player1);
            game.addPlayer(player2);

            // Flush player queue
            game.tick();

            sinon.stub(player1, 'move');
            sinon.stub(player2, 'move');

            game.tick();
            player1.move.callCount.should.eql(1);
            player2.move.callCount.should.eql(1);
        });

        it('should remove players who are out of bounds', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            player1.setPosition(new Point(0, 0));
            player1.setDirection('west');
            player2.setPosition(new Point(1, 4));
            player2.setDirection('north');
            game.addPlayer(player1);
            game.addPlayer(player2);

            // Flush player queue
            game.tick();
            game.getPlayers().length.should.eql(2);

            game.tick();
            game.getPlayers().length.should.eql(1);
            game.getPlayers()[0].should.eql(player2);
        });

        it('should remove the colliding player when two players collide in a head to body collision', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            player1.setPosition(new Point(0, 0));
            player1.setDirection('east');
            player2.setPosition(new Point(0, 2));
            player2.setDirection('north');
            game.addPlayer(player1);
            game.addPlayer(player2);
            // Flush the player queue
            game.tick();
            game.getPlayers().length.should.eql(2);

            // Move twice so player2 head collides with player1 body
            game.tick();
            game.getPlayers().length.should.eql(2);
            game.tick();
            game.getPlayers().length.should.eql(1);
            game.getPlayers()[0].should.eql(player1);
        });

        it('should remove the both players when two players collide in a head to head collision', function () {
            var player1 = new Player('test1'),
                player2 = new Player('test2');

            player1.setPosition(new Point(1, 0));
            player1.setDirection('west');
            player2.setPosition(new Point(0, 1));
            player2.setDirection('north');
            game.addPlayer(player1);
            game.addPlayer(player2);
            // Flush the player queue
            game.tick();
            game.getPlayers().length.should.eql(2);

            // Move once so player2 and player1 have a head to head collision
            game.tick();
            game.getPlayers().should.be.empty;
        });

        it('should feed players who collide with food and remove food from the game', function () {

        });

        it('should add any queued players to the game, assigning them a random position if they dont already have one', function () {

        });

        it('should update the game matrix', function () {

        })

        it('should trigger a tick event', function () {

        });

        it('should pause the game and trigger a gameover event if there are no more players', function () {

        });

        it('should schedule the next tick event using setTimeout if the game is still running', function () {

        });
    });

});