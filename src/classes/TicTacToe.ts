import {
    ButtonInteraction,
    Collection,
    CommandInteraction, InteractionReplyOptions, Message,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu, SelectMenuInteraction, Snowflake, TextChannel,
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
    readonly players: Snowflake[];
    #channel: TextChannel;
    #interaction: CommandInteraction;
    #message: InteractionReplyOptions | undefined;
    #isGameActive = false;

    constructor(players: Snowflake[], interaction: CommandInteraction) {
        this.players = players;
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
        let message: InteractionReplyOptions = { content: `<@${this.players[0]}> vs. TBD`, components: [] };
        for (let v = 0; v < this.#board.length; ++v) {    // iterate through rows
            const buttons = new MessageActionRow();
            for (let h = 0; h < this.#board[v].length; ++h) {     // iterate through spaces
                const space = this.#board[v][h];
                const button = new MessageButton()
                    .setStyle("SECONDARY")
                    .setCustomId(`${this.players[0]}[${v},${h}]`);
                if (space)
                    button.setEmoji(emoji[space]);
                else
                    button.setLabel(" ");
                buttons.addComponents(button);
            }
            message.components?.push(buttons);
        }
        if (this.players.length < 2) {
            message = await this.#setupUserSelect(message);
            await this.#interaction.reply({ ...message, fetchReply: true });
        } else {
            message.content = `<@${this.players[0]}> vs. <@${this.players[1]}>`;
            await this.invitePlayer(this.players[1], this.#interaction);
            await this.#interaction.reply({ ...message, fetchReply: true });
        }

        // if message did not get overridden in #setupUserSelect, add the TicTacToe instance to the collection of running games
        if (message.components) {
            const client = this.#interaction.client as ClientPlus;
            if (client.tictactoe.has(this.#channel.id))
                client.tictactoe.get(this.#channel.id)?.set(this.players[0], this);
            else
                client.tictactoe.set(this.#channel.id, new Collection([[this.players[0], this]]));
        }

        this.#message = message;
    }

    #setupUserSelect = async (message: InteractionReplyOptions): Promise<InteractionReplyOptions> => {
        const members = await this.#channel.guild.members.fetch();
        const nonBotMembers = members.filter(member => member.id !== this.players[0]);    // !member.user.bot && member.id !== this.#players[0]
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
                .setCustomId(`${this.#channel.id}:${this.players[0]}`)    // ID of channel the game is in, then ID of the user who created the game, split by a colon
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

    invitePlayer = async (newPlayerId: Snowflake, interaction: SelectMenuInteraction) => {
        if (!this.#message?.components)
            return;

        if (!this.players.includes(newPlayerId))
            this.players.push(newPlayerId);

        this.#message.content = `<@${this.players[0]}> vs. TBD (invitation for <@${this.players[1]}> pending)`;

        const acceptButton = new MessageButton()
            .setStyle("SUCCESS")
            .setCustomId(`accept:${this.#channel.id}:${this.players[0]}`)    // "accept", then ID of channel the game is in, then ID of the user who created the game, split by a colon
            .setEmoji("✔");
        const declineButton = new MessageButton()
            .setStyle("DANGER")
            .setCustomId(`decline:${this.#channel.id}:${this.players[0]}`)    // "decline", then ID of channel the game is in, then ID of the user who created the game, split by a colon
            .setEmoji("✖");

        const invitationRow = new MessageActionRow()
            .addComponents([acceptButton, declineButton]);

        this.#message.components.pop();
        this.#message.components.push(invitationRow);

        await interaction.update(this.#message);

        if (!(interaction.message instanceof Message))
            return;

        await interaction.message.reply(`_<@${newPlayerId}> You've been invited to a game of Tic-Tac-Toe. Press the checkmark in the message above to accept, or the cross to decline._`);
    }

    acceptInvite = async (interaction: ButtonInteraction) => {
        if (!this.#message?.components)
            return;

        this.#message.content = `<@${this.players[0]}> vs. <@${this.players[1]}>`;
        this.#message.components.pop();

        await interaction.update(this.#message);

        await this.#startGame();
    }

    declineInvite = async (interaction: ButtonInteraction) => {
        if (!this.#message?.components)
            return;

        this.players.pop();

        this.#message.content = `<@${this.players[0]}> vs. TBD`;
        this.#message.components.pop();
        this.#message = await this.#setupUserSelect(this.#message);

        await interaction.update(this.#message);
    }

    #startGame = async () => {
        if (!this.#message)
            return;

        this.#isGameActive = true;

        if (Math.random() < 0.5) {
            const last = this.players.pop();
            if (last)
                this.players.unshift(last);
        }

        this.#message.content = `**X:** _<@${this.players[0]}>_ vs. **O:** <@${this.players[1]}>`;
    }
}

export default TicTacToe;