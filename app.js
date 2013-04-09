/**
 * Super simple demo app to get the snake server up and running.
 * A single demo game is created and exposed at http://localhost:3000/games/demo
 * This will run the game server on port 3000 and wait for clients to connect.
 */

// Include dependencies
var Snake = require('./index'),
    http = require('http'),
    app = http.createServer(),
    io = require('socket.io').listen(app);

// Create a new game server and pass it the io instance
var snakeServer = new Snake.GameServer(io, '/games');

// Create the demo game with some custom settings
snakeServer.createGame({
    width: 40,
    height: 40,
    speed: 30
}, 'demo');

// Start the HTTP server on port 3000
app.listen(3000);