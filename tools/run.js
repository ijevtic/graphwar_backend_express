function runServer (server) {
    server.listen(3000, () => {
        console.log('listening on *:3000');
      });
}

module.exports = {
    runServer
}