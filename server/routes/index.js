
var _ = require('lodash');

var dependencies = {};

module.exports = {

    inject: function(injected) {
        dependencies = _.extend(dependencies, injected);
    },

    getIndex: function(req, res){
        res.render('index', { title: 'Express' });
    },

    getGame: function(req, res){
        res.render('game', {
            title: 'Game',
            id: req.route.params.id
        });
    },

    createGame: function(req, res){

    }
};