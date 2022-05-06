import {
    Message,
    MessageActionRow,
    MessageButton,
    MessageOptions,
    TextChannel,
    User
} from "discord.js";

type TicTacToeSpace = "x" | "o" | null;

// Manages board state
class TicTacToe {
    #board: TicTacToeSpace[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    #xTurn = true;
    #players: User[];
    #channel: TextChannel;
    #message: Message | undefined;

    constructor(players: User[], channel: TextChannel) {
        this.#players = players;
        this.#channel = channel;
        this.#update();
    }

    #update = (): void => {
        const emoji = {
            x: "❌",
            o: "⭕"
        }
        const message: MessageOptions = { components: [] };
        for (let i = 0; i < this.#board.length; ++i) {    // iterate through rows
            const buttons = new MessageActionRow();
            for (let j = 0; j < this.#board[i].length; ++j) {     // iterate through spaces
                const space = this.#board[i][j];
                const button = new MessageButton()
                    .setStyle("SECONDARY")
                    .setCustomId(`[${i},${j}]`);
                if (space)
                    button.setEmoji(emoji[space]);
                else
                    button.setLabel(" ");
                buttons.addComponents(button);
            }
            message.components?.push(buttons);
        }
        this.#channel.send(message)
            .then(message => this.#message = message);
    }
}

export default TicTacToe;