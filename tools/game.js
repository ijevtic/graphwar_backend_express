class Game {
    constructor(game_id, players, io) {
        this.game_id = game_id;
        this.players = players;
        this.turn = 0;
        this.num_turns = 0;
        this.io = io;
    }

    changeTurn(game_map) {
        this.turn = 1-this.turn;
        console.log("sad je ovaj turn " + this.turn);
        this.io.to(this.players[this.turn]).emit('turn info', 'Your turn');
        this.io.to(this.players[(this.turn+1)%2]).emit('turn info', 'Opponent turn');
        setTimeout(timeUp, process.env.TURN_TIME, this.num_turns, this, game_map);
        
    }

    start(game_map) {
        console.log("pocinjem");
        console.log(this.num_turns);
        this.io.to(this.players[this.turn]).emit('turn info', 'Your turn');
        this.io.to(this.players[(this.turn+1)%2]).emit('turn info', 'Opponent turn');
        setTimeout(timeUp, process.env.TURN_TIME, this.num_turns, this, game_map);
    }

    playTurn(p, game_map) {
        if(p !== this.players[this.turn]) {
            console.log("nije tvoj red klosaru");
            return;
        }
        console.log("igrao je igrac " + this.turn);
        this.num_turns++;
        this.changeTurn(game_map);
    }
}

const timeUp = (num, game, game_map) => {
    console.log(game.num_turns);
    if(!game_map.has(game.game_id) || num!=game.num_turns) return;
    console.log("isteklo vreme");
    game.num_turns++;
    game.changeTurn(game_map);
}

module.exports = {
    Game
}