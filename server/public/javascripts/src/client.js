window.Snake = {};
window.Snake.Views = {};
window.Snake.Models = {};

$(document).ready(function () {
    console.info(window.location.pathname);
    var socket = io.connect(window.location.pathname);
    socket.on('connect:success', function (data) {
        console.log('connected', data);
    });
});