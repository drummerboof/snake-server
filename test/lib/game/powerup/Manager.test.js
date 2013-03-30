describe('PowerUp Manager', function () {

    var _ = require('lodash'),
        sinon = require('sinon'),
        Player = require('../../../../lib/game/Player'),
        PowerUpManager = require('../../../../lib/game/powerup/Manager'),
        AbstractPowerUp = require('../../../../lib/game/powerup/AbstractPowerUp');

    var ConcretePowerUp = AbstractPowerUp.extend({
        _identifier: 'test',
        _duration: 5000,
        _stackable: true
    });
    var ConcretePowerUpLong = AbstractPowerUp.extend({
        _identifier: 'long',
        _duration: 10000,
        _stackable: false
    });

    describe('#Manager() #getPowerUps()', function () {

        it('should initialize the powerUps array and set the player for this manager', function () {
            var player = new Player('test'),
                manager = new PowerUpManager(player);
            manager.getPowerUps().should.be.empty;
        });
    });

    describe('#add()', function () {

        it('should add the PowerUp to the manager and call the PowerUp applyTo() method', function () {
            var powerUp = new ConcretePowerUp(),
                player = new Player('test'),
                manager = new PowerUpManager(player),
                clock = sinon.useFakeTimers(1364416465537);

            sinon.stub(powerUp, 'applyTo');
            manager.add(powerUp);

            powerUp.applyTo.calledWithExactly(player).should.be.true;
            manager.getPowerUps().length.should.eql(1);
            manager.getPowerUps()[0].should.eql(powerUp);
        });

        it('should not allow two or more of the same powerUp if they are not stackable', function () {

            var stackablePowerUp = new ConcretePowerUpLong(),
                unStackablePowerUp = new ConcretePowerUp(),
                player = new Player('test'),
                manager = new PowerUpManager(player),
                provider = [{
                    powerUp: stackablePowerUp,
                    expectedLength: 1
                }];

            _.each(provider, function (data) {
                manager.add(data.powerUp);
                manager.getPowerUps().length.should.eql(data.expectedLength);
            }, this);
        });
    });

    describe('#hook()', function () {

        it('should call the given hook method on all of the powerUps which have implemented it and return the modified value', function () {
            var powerUp1 = new ConcretePowerUp(),
                powerUp2 = new ConcretePowerUp(),
                player = new Player('test'),
                manager = new PowerUpManager(player),
                arg = 5,
                result;

            ConcretePowerUp.prototype.testHook = function (player, value) {
                console.log(value);
                return value * 2;
            };

            manager.add(powerUp1);
            manager.add(powerUp2);

            manager.hook('testHook', arg).should.eql(20);
        });

        it('should pass any additional arguments into the hook method', function (done) {
            var powerUp = new ConcretePowerUp(),
                player = new Player('test'),
                manager = new PowerUpManager(player);

            ConcretePowerUp.prototype.testHook = function (player, value, additional1, additional2) {
                if (additional1 !== 2) throw new Error('additional1 was not correct');
                if (additional2 !== 3) throw new Error('additional2 was not correct');
                done();
            };

            manager.add(powerUp);
            manager.hook('testHook', 1, 2, 3)
        });

        it('should add the hook to the list of registered hooks ignoring duplicates', function () {
            var manager = new PowerUpManager(new Player('test'));
            manager.hook('testHook');
            manager.hook('testHook');
            manager.hook('anotherHook');
            manager.getRegisteredHooks().should.eql([
                'testHook',
                'anotherHook'
            ]);
        });
    });

    describe('#has()', function () {
        it('should return true if a powerUp with the given ID has already beed added', function () {
            var manager = new PowerUpManager(new Player('test'));

            manager.add(new ConcretePowerUp());
            manager.has('test').should.be.true;
            manager.has('long').should.be.false;
        });
    });

    describe('#clear()', function () {

        it('should call removeFrom() for each PowerUp and clear the manager', function () {
            var powerUp1 = new ConcretePowerUp(),
                powerUp2 = new ConcretePowerUp(),
                player = new Player('test'),
                manager = new PowerUpManager(player);

            sinon.spy(powerUp1, 'removeFrom');
            sinon.spy(powerUp2, 'removeFrom');

            manager.hook('testHook');
            manager.add(powerUp1);
            manager.add(powerUp2);
            manager.getPowerUps().length.should.eql(2);
            manager.getRegisteredHooks().length.should.eql(1);

            manager.clear();
            powerUp1.removeFrom.calledWithExactly(player).should.be.true;
            powerUp2.removeFrom.calledWithExactly(player).should.be.true;
            manager.getPowerUps().length.should.eql(0);
            manager.getRegisteredHooks().length.should.eql(0);
        });
    });

    describe('#purgeExpired()', function () {

        it('should remove powerUps which have expired from the manager', function () {
            var powerUp1 = new ConcretePowerUp(),
                powerUp2 = new ConcretePowerUpLong(),
                player = new Player('test'),
                manager = new PowerUpManager(player),
                clock = sinon.useFakeTimers();

            sinon.spy(powerUp1, 'removeFrom');
            sinon.spy(powerUp2, 'removeFrom');

            manager.add(powerUp1);
            manager.add(powerUp2);

            clock.tick(5000);
            manager.purgeExpired();

            powerUp2.removeFrom.called.should.be.false;
            powerUp1.removeFrom.calledWithExactly(player).should.be.true;
            manager.getPowerUps().length.should.eql(1);
            manager.getPowerUps()[0].should.eql(powerUp2);

        });
    });
});