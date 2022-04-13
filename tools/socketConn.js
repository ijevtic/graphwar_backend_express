const { Server } = require("socket.io");
const {removeFromWaitingRoom, joinRoomRequest, leaveGameRequest, playTurnRequest} = require("./room_game_functions.js")
require('dotenv').config()

function setupSocketIO (server) {

    const io = new Server(server, {});
      
      async function printSockets () {
        const sockets = await io.fetchSockets();
        for(const socket of sockets ) {
          console.log(socket.id);
        }
      }
    
    io.on('connection', (socket) => {
        console.log('a user connected');

        printSockets();

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        
        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.emit('chat message', msg);
        });

        socket.on('join room', (token) => {
            joinRoomRequest(io, socket.id);
        });

        socket.on('leave room', (token) => {
            removeFromWaitingRoom(io, socket.id);
        });

        socket.on('leave game', (token) => {
            leaveGameRequest(io, socket.id);
        });

        socket.on('play', (token) => {
            playTurnRequest(socket.id);
        });
    });
}

module.exports = {
    setupSocketIO
}