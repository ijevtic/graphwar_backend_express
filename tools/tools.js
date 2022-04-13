const runServer = require('./run.js').runServer;
const setupSocketIO = require('./socketConn.js').setupSocketIO;

module.exports = {
    runServer,
    setupSocketIO
}