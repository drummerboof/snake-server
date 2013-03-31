var fs = require('fs'),
    path = require('path');

var Game = {
    PowerUp: {}
};

function loadFilesOntoObject(directory, obj) {
    fs.readdirSync(directory).forEach(function(file) {
        if (fs.statSync(path.join(directory, file)).isFile()) {
            obj[path.basename(file, '.js')] = require(path.join(directory, file));
        }
    });
}

loadFilesOntoObject(path.join(__dirname, 'src/game'), Game);
loadFilesOntoObject(path.join(__dirname, 'src/game/powerup'), Game.PowerUp);

module.exports = Game;
