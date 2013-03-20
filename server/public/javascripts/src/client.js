window.Snake = {};
window.Snake.Views = {};
window.Snake.Models = {};

$(document).ready(function () {

    var socket = io.connect('http://localhost:3000'),
        game = new Snake.Models.GameModel({
            socket: socket
        }),
        view = new Snake.Views.GameView({
            model: game
        });

    game.join('boof' + new Date().getMilliseconds());
    view.render();

    window.game = game;
});