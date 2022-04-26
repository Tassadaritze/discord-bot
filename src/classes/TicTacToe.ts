import { User } from "discord.js";

type TicTacToeSpace = "X" | "O" | " ";
interface Players {
    x: User,
    o: User
}

// Keeps track of board state
class TicTacToe {
    #board: TicTacToeSpace[][] = [
        [" ", " ", " "],
        [" ", " ", " "],
        [" ", " ", " "]
    ];
    #xTurn = true;
    #players: Players;

    constructor(players: Players) {
        this.#players = players;
    }


}

export default TicTacToe;