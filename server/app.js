var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    cons = require('consolidate'),
    swig = require('swig'),
    path = require('path'),
    socketIo = require('socket.io'),
    GameServer = require('../lib/game/GameServer');

var app = express(),
    server, io, gameServer;

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.set('view options', { layout: false });
    app.engine('.html', cons.swig);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});
swig.init({ cache: false, root: __dirname + '/views' });
app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.getIndex);
app.get('/games/:id', routes.getGame);
app.post('/games', routes.createGame);

server = http.createServer(app);
io = socketIo.listen(server, { log: false });
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
gameServer = new GameServer(io, '/games');
gameServer.createGame({
    width: 50,
    height: 50,
    speed: 80
}, 'test');

routes.inject({
    gameServer: gameServer
});
