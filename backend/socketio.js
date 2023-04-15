const socketio = require('socket.io');

let io;
const init = function (server) {
    io = socketio(server);
    return io;
}
const getIO =  function() {
    if (!io) {
        throw new Error("Can't get io instance before calling .init()");
    }
    return io;
}
exports.init = init
exports.getIO = getIO
