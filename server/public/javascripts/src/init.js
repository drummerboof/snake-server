window.Snake = {};
window.Snake.Views = {};
window.Snake.Models = {};
window.Snake.Collections = {};

$(document).ready(function () {
    window.app = new Snake.App({
        io: io
    });
});