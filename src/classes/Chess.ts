

// Lowercase for colour, uppercase for type; null is empty square
type ChessPiece = "bP" | "wP" | "bN" | "wN" | "bB" | "wB" | "bR" | "wR" | "bQ" | "wQ" | "bK" | "wK" | null;

// Keeps track of board state
class Chess {
    #board: ChessPiece[][];

    constructor() {
        this.#board = [
            ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
            ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
            ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
        ];
    }

    getMoves = (h: number, v: number): number[][] => {
        let moves: number[][] = [];
        const piece = this.board[h][v];

        if (piece === null)
            return moves;

        switch (piece[1]) {
        case "R":
            moves = [...this.getRookMoves(piece[0], h, v)];
            break;
        case "N":
            
            break;
        }

        return moves;
    }

    getRookMoves = (colour: string, h: number, v: number): number[][] => {
        const moves: number[][] = [];

        // Loop through both positive and negative on each axis
        for (let i = -1; i < 2; i += 2) {
            let n = h + i;
            // Loop through horizontal axis
            while (n > 0 && n < this.board.length) {
                const square = this.board[n][v];
                // If another piece is in the way, the rook cannot move further in that direction
                if (square !== null) {
                    // ...But if it's a piece of a different colour, then it can be taken (as long as it's not the king)
                    if (colour !== square[0] && square[1] !== "K")
                        moves.push([n, v]);
                    break;
                }
                moves.push([n, v]);
                n += i;
            }

            n = v + i;
            // Loop through vertical axis
            while (n > 0 && n < this.board.length) {
                const square = this.board[h][n];
                // If another piece is in the way, the rook cannot move further in that direction
                if (square !== null) {
                    // ...But if it's a piece of a different colour, then it can be taken (as long as it's not the king)
                    if (colour !== square[0] && square[1] !== "K")
                        moves.push([h, n]);
                    break;
                }
                moves.push([h, n]);
                n += i;
            }
        }

        return moves;
    }

    get board(): ChessPiece[][] {
        return this.#board;
    }
}

/*
// TODO: describe ChessPiece class
class ChessPiece {
    type: ChessPieceType;
    h: number;
    v: number;
    isWhite = false;

    constructor(type: ChessPieceType, h: number, v: number, isWhite?: boolean) {
        this.type = type;
        if (h < 0 || h >= Chess.BOARD_SIZE || v < 0 || v >= Chess.BOARD_SIZE)
            throw new RangeError("Chess pieces can't be created off the board");
        this.h = h;
        this.v = v;
        if (isWhite)
            this.isWhite = isWhite;
    }
}
 */

export default Chess;