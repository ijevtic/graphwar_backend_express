const { Game } = require("./game.js");

var lock = false;
var waiting_room = [];
const user_game = new Map();
const game_map = new Map();
const player_ready = new Map();

function createGame(io, p1, p2) {
    var game_id = Math.random().toString(36).slice(2, 7);
    io.in(p1).socketsJoin(game_id);
    io.in(p2).socketsJoin(game_id);
    user_game.set(p1, game_id);
    user_game.set(p2, game_id);
    var g = new Game(game_id, [p1, p2], io);
    game_map.set(game_id, g);

    setupGame(g, game_map);
}

function setupGame(game, game_map) {
    player_ready.delete(game.players[0]);
    player_ready.delete(game.players[1]);
    game.io.to(game.game_id).emit('game start', "dobrodosli u game " + game.game_id);
    setTimeout(isReady, process.env.READY_TIME, game, game_map);
}

function isReady(game, game_map) {
    if (player_ready.get(game.players[0]) && player_ready.get(game.players[1])) {
        game.start(game_map);
    } else {
        deleteGame(game.io, game.game_id);
    }
}

function playerReady(p) {
    player_ready.set(p, true);
}

function deleteGame(io, game_id) {
    if (!game_map.has(game_id)) return;
    var users = game_map.get(game_id).players;
    game_map.delete(game_id);
    console.log("obrisao");
    user_game.delete(users[0]);
    user_game.delete(users[1]);
    io.to(game_id).emit('game end', "izbaceni ste jbg " + game_id);
    io.socketsLeave(game_id);

}

function emptyWaitingRoom(io) {
    while (lock);
    lock = true;
    var poceo = false;
    var p1, p2;
    if (waiting_room.length >= 2) {
        poceo = true;
        p1 = waiting_room[0];
        p2 = waiting_room[1];
        waiting_room.splice(0, 2);
    }
    lock = false;
    if (poceo)
        createGame(io, p1, p2);
}

function removeFromWaitingRoom(p) {
    while (lock);
    lock = true;
    console.log(waiting_room);
    waiting_room = waiting_room.filter(
        x => x != p
    );
    console.log(waiting_room);
    lock = false;
}

function removeDisconnectedPlayer(io, p) {
    if (user_game.has(p)) {
        deleteGame(io, user_game.get(p));
        return;
    }
    removeFromWaitingRoom(p);
}

function joinRoomRequest(io, p) {
    if (waiting_room.includes(p)) return;
    waiting_room.push(p);
    console.log(waiting_room.length);
    emptyWaitingRoom(io);
}

function leaveGameRequest(io, p) {
    if (user_game.has(p))
        deleteGame(io, user_game.get(p));
}

function playTurnRequest(p) {
    if (user_game.has(p)) {
        var game_id = user_game.get(p);
        if (game_map.has(game_id)) {
            console.log("pa uso");
            game_map.get(game_id).playTurn(p, game_map);
        }
    }
}

function sendChatMessage(io, p, message){
    if (user_game.has(p)) {
        var game_id = user_game.get(p);
        if (game_map.has(game_id)) {
            let game = game_map.get(game_id);
            let players = game.players;
            let player1 = players[0];
            let player2 = players[1];
            if (p == player1) {
                io.to(player2).emit('chat message', message);
            } else {
                io.to(player1).emit('chat message', message);
            }
        }
    }
}

module.exports = {
    removeFromWaitingRoom,
    joinRoomRequest,
    leaveGameRequest,
    playTurnRequest,
    removeDisconnectedPlayer,
    sendChatMessage,
    playerReady
}