Snake.Views.GameView = Backbone.View.extend({

    el: '#game',

    cellSize: 10,

    cells: null,

    events: {
        'click #buttonGameToggle': '_toggleGame'
    },

    keyMap: {
        37: 'west',
        38: 'north',
        39: 'east',
        40: 'south'
    },

    initialize: function () {
        this.cells = [];
        this.model.on('change:game', this.update, this);
        this.model.on('change:status', this._updateButton, this);
        this.model.set({
            id: this.$el.data('game'),
            width: this.$el.data('width'),
            height: this.$el.data('height')
        });
        $(document).keydown(_.bind(this._onKeyPress, this));
    },

    render: function () {
        var fragment = $(document.createDocumentFragment());
        for (var x = 0; x < this.model.get('width'); x++) {
            this.cells[x] = [];
            for (var y = 0; y < this.model.get('height'); y++) {
                var cell = $('<div/>').css({
                    width: this.cellSize + 'px',
                    height: this.cellSize + 'px',
                    top: y * this.cellSize + 'px',
                    left: x * this.cellSize + 'px'
                });
                this.cells[x][y] = cell;
                fragment.append(cell);
            }
        }
        this.$('#canvas')
            .width(this.model.get('width') * this.cellSize)
            .height(this.model.get('height') * this.cellSize)
            .empty()
            .append(fragment);
    },

    update: function () {
        var matrix = this.model.get('game').matrix;
        _.each(matrix, function (column, x) {
            _.each(column, function (cell, y) {
                this.cells[x][y].attr('class', '');
                if (cell !== null) {
                    var components = cell.split(':');
                    this.cells[x][y].addClass(components[0]);
                    if (components[0] === 'player' && components[1] === this.model.get('player')) {
                        this.cells[x][y].addClass('current');
                    }
                }
            }, this)
        }, this);
    },

    _updateButton: function () {
        this.$('#buttonGameToggle').text(this.model.isRunning() ? 'Pause' : 'Play');
    },

    _toggleGame: function () {
        this.model.toggleGame();
    },

    _onKeyPress: function (e) {
        if (_.has(this.keyMap, e.keyCode)) {
            e.preventDefault();
            this.model.set({ direction: this.keyMap[e.keyCode] });
        }
    }

});