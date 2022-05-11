import {
    Collection,
    CommandInteraction, InteractionReplyOptions, Message,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu, TextChannel,
    User
} from "discord.js";
import ClientPlus from "./ClientPlus.js";

type TicTacToeSpace = "x" | "o" | null;

// Manages board state
class TicTacToe {
    #board: TicTacToeSpace[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    #isXTurn = true;
    #players: User[];
    #channel: TextChannel;
    #interaction: CommandInteraction;
    #isGameActive = false;

    constructor(players: User[], interaction: CommandInteraction) {
        this.#players = players;
        this.#interaction = interaction;
        if (!(interaction.channel instanceof TextChannel))
            throw new TypeError("TicTacToe interaction channel is not instance of TextChannel");
        this.#channel = interaction.channel;
        this.#initialize().catch(console.error);
    }

    #initialize = async () => {
        const emoji = {
            x: "❌",
            o: "⭕"
        }
        let message: InteractionReplyOptions = { content: `<@${this.#players[0].id}> vs. TBD`, components: [] };
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
            message = await this.#setupUserSelect(message);
            await this.#interaction.reply({ ...message, fetchReply: true });
        } else {
            message.content = `<@${this.#players[0].id}> vs. <@${this.#players[1].id}>`;
            await this.#interaction.reply({ ...message, fetchReply: true });
        }

        // if message did not get overridden in #setupUserSelect, add the TicTacToe instance to the collection of running games
        if (message.components) {
            const client = this.#interaction.client as ClientPlus;
            if (client.tictactoe.has(this.#channel.id))
                client.tictactoe.get(this.#channel.id)?.set(this.#players[0].id, this);
            else
                client.tictactoe.set(this.#channel.id, new Collection([[this.#players[0].id, this]]));
        }
    }

    #setupUserSelect = async (message: InteractionReplyOptions): Promise<InteractionReplyOptions> => {
        const members = await this.#channel.guild.members.fetch();
        const nonBotMembers = members.filter(member => !member.user.bot && member.id !== this.#players[0].id);
        if (nonBotMembers.size > 0) {
            while (nonBotMembers.size > 25) {
                const random = nonBotMembers.randomKey();
                if (random)
                    nonBotMembers.delete(random);
                // should never happen, but...
                else
                    break;
            }
            const userSelectMenu = new MessageSelectMenu()
                .setCustomId(`${this.#channel.id}:${this.#players[0].id}`)    // ID of channel the game is in, then ID of the user who created the game, split by a colon
                .setPlaceholder("Challenge a user...");
            nonBotMembers.forEach(member => {
                userSelectMenu
                    .addOptions({
                        label: member.displayName,
                        value: member.id,
                        description: `${member.user.username}#${member.user.discriminator}`,
                        emoji: "🇺"    // U+1F1FA -- U emoji for User
                    });
            });
            message.components?.push(new MessageActionRow().addComponents(userSelectMenu));

            return message;
        } else {
            return { content: "_Sorry, I couldn't find anyone on the server for you to play with!_" };
        }
    }

    #addPlayer = async (newPlayer: User) => {

    }
}

export default TicTacToe;