const { Server } = require("socket.io");
const {removeFromWaitingRoom, joinRoomRequest, leaveGameRequest, playTurnRequest, removeDisconnectedPlayer, sendChatMessage, playerReady} = require("./room_game_functions.js")
require('dotenv').config()

function setupSocketIO (server) {

    const io = new Server(server, {
        cors: {
          origin: '*',
        }
      });

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
            removeDisconnectedPlayer(io, socket.id);
            //izbacivanje iz sobe/igre
        });
        
        socket.on('chat message', (msg) => {
            sendChatMessage(io, socket.id, msg);
        });

        socket.on('join room', (token) => {
            joinRoomRequest(io, socket.id);
        });

        socket.on('leave room', (token) => {
            removeFromWaitingRoom(socket.id);
        });

        socket.on('leave game', (token) => {
            leaveGameRequest(io, socket.id);
        });

        socket.on('play', (token) => {
            playTurnRequest(socket.id);
        });

        socket.on('ready for game', (token) => {
            playerReady(socket.id);
            console.log("ready for game " + socket.id);
        });
    });
}

module.exports = {
    setupSocketIO
}