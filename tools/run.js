const { Server } = require("socket.io");

function runServer (server) {
    server.listen(3000, () => {
        console.log('listening on *:3000');
      });
}

function setupIO (server) {

    const io = new Server(server, {});
    
    async function f(socket) {
        var clients = await io.in("room1").fetchSockets();
        console.log(clients.length);
        io.socketsLeave("room1");
        clients = await io.in("room1").fetchSockets();
        console.log(clients.length);
          // for(c in clients)
          //   console.log(c);
      }
      
      async function printSockets () {
        const sockets = await io.fetchSockets();
        for(const socket of sockets ) {
          console.log(socket.id);
        }
      }
    
    io.on('connection', (socket) => {
        console.log('a user connected');
        // const cnt = io.of("/").sockets.clientCount;
        // console.log(cnt);
        // io.in(socket.id).socketsJoin("room1");

        printSockets();
        // socket.broadcast.emit('hi');
        io.emit('chat message', 'stigao je novi korisnik')
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.emit('chat message', msg);
        });
    });
}

module.exports = {
    runServer,
    setupIO
}