import {
    Message,
    MessageActionRow,
    MessageButton,
    MessageOptions, MessageSelectMenu,
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
    #gameActive = false;

    constructor(players: User[], channel: TextChannel) {
        this.#players = players;
        this.#channel = channel;
        this.#update().catch(e => console.error(e));
    }

    #update = async (): Promise<void> => {
        const emoji = {
            x: "❌",
            o: "⭕"
        }
        const message: MessageOptions = { content: `<@${this.#players[0].id}> vs. TBD`, components: [] };
        for (let v = 0; v < this.#board.length; ++v) {    // iterate through rows
            const buttons = new MessageActionRow();
            for (let h = 0; h < this.#board[v].length; ++h) {     // iterate through spaces
                const space = this.#board[v][h];
                const button = new MessageButton()
                    .setStyle("SECONDARY")
                    .setCustomId(`${this.#players[0].id}[${v},${h}]`);
                if (space)
                    button.setEmoji(emoji[space]);
                else
                    button.setLabel(" ");
                buttons.addComponents(button);
            }
            message.components?.push(buttons);
        }
        if (this.#players.length < 2) {
            this.#channel.guild.members.fetch()
                .then(members => {
                    const nonBotMembers = members.filter(member => !member.user.bot && member.id !== this.#players[0].id);
                    message.components?.push(new MessageActionRow()
                        .addComponents(new MessageSelectMenu()
                            .setPlaceholder("Challenge a user...")));
                })
                .catch(e => console.error(e));
        }
        this.#channel.send(message)
            .then(message => this.#message = message);
    }
}

export default TicTacToe;