Snake.Views.Canvas = (function () {

    var Canvas = Backbone.View.extend({

        el: '#canvas',

        cellSize: 10,

        canvasSize: 500,

        cells: null,

        initialize: function (options) {
            this.cells = [];
            this.model.on('change:matrix', function () {
                this.render(false)
            }, this);
        },

        render: function (force) {
            if (this.$el.children().length === 0 || force) {
                this.cellSize = this.canvasSize / this.model.get('width');
                console.log(this.cellSize);
                var fragment = $(document.createDocumentFragment());
                for (var x = 0; x < this.model.get('width'); x++) {
                    this.cells[x] = [];
                    for (var y = 0; y < this.model.get('height'); y++) {
                        this.cells[x][y] = this._createCell(x, y);
                        fragment.append(this.cells[x][y]);
                    }
                }
                this.$el.empty().append(fragment);
            }
            this.update();
            return this;
        },

        _createCell: function (x, y) {
            return $('<div/>').css({
                width: this.cellSize + 'px',
                height: this.cellSize + 'px',
                top: y * this.cellSize + 'px',
                left: x * this.cellSize + 'px'
            });
        },

        update: function () {
            var matrix = this.model.get('matrix');
            _.each(matrix, function (column, x) {
                _.each(column, function (cell, y) {
                    this.cells[x][y].attr('class', '');
                    if (cell !== null) {
                        var components = cell.split(':');
                        this.cells[x][y].addClass(components[0]);
                        if (components[0] === 'player' && components[1] === this.model.player.get('name')) {
                            this.cells[x][y].addClass('current');
                        }
                    }
                }, this);
            }, this);

        }
    });

    return Canvas;
}());