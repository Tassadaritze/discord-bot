import {
    ButtonInteraction,
    Collection,
    CommandInteraction,
    InteractionReplyOptions,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEditOptions,
    MessageSelectMenu,
    SelectMenuInteraction,
    Snowflake,
    TextChannel,
    User
} from "discord.js";
import winston from "winston";
import ClientPlus from "./ClientPlus.js";

type TicTacToeSpace = "x" | "o" | null;

// Manages board state
class TicTacToe {
    #board: TicTacToeSpace[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    #emoji = {
        x: "❌",
        o: "⭕"
    };
    isXTurn = true;
    readonly players: Snowflake[];
    #channel: TextChannel;
    #interaction: CommandInteraction;
    #message: MessageEditOptions | undefined;
    #latestInvitation: Message | null = null;
    #isGameActive = false;

    constructor(host: User, interaction: CommandInteraction, opponent: User | null) {
        this.players = [host.id];
        if (opponent) {
            this.players.push(opponent.id);
        }
        this.#interaction = interaction;
        if (!(interaction.channel instanceof TextChannel)) {
            throw new TypeError("TicTacToe interaction channel is not instance of TextChannel");
        }
        this.#channel = interaction.channel;
        this.#initialize().catch(winston.error);
    }

    #initialize = async () => {
        this.#message = { content: `<@${this.players[0]}> vs. TBD`, components: [] };
        for (let v = 0; v < this.#board.length; ++v) {
            // iterate through rows
            const buttons = new MessageActionRow();
            for (let h = 0; h < this.#board[v].length; ++h) {
                // iterate through spaces
                const space = this.#board[v][h];
                const button = new MessageButton()
                    .setStyle("SECONDARY")
                    .setCustomId(`${this.#channel.id}:${this.players[0]}:${v},${h}`); // ID of channel the game is in, then ID of the user who created the game, then row index, then column index, split by a colon
                if (space) {
                    button.setEmoji(this.#emoji[space]);
                } else {
                    button.setLabel(" ");
                }
                buttons.addComponents(button);
            }
            this.#message.components?.push(buttons);
        }

        if (this.players.length < 2) {
            await this.#setupUserSelect();
        } else {
            this.#setupPlayerInvite();
        }
        const message = await this.#interaction.reply({
            ...(<InteractionReplyOptions>this.#message),
            fetchReply: true
        });

        if (this.players.length > 1 && message instanceof Message) {
            this.#latestInvitation = await message.reply(
                `_<@${this.players[1]}> You've been invited to a game of Tic-Tac-Toe. Press the checkmark in the message above to accept, or the cross to decline._`
            );
        }

        // if message did not get overridden in #setupUserSelect, add the TicTacToe instance to the collection of running games
        if (this.#message.components) {
            const client = this.#interaction.client as ClientPlus;
            if (client.tictactoe.has(this.#channel.id)) {
                client.tictactoe.get(this.#channel.id)?.set(this.players[0], this);
            } else {
                client.tictactoe.set(this.#channel.id, new Collection([[this.players[0], this]]));
            }
        }
    };

    #setupUserSelect = async () => {
        if (!this.#message?.components) {
            return;
        }

        const members = await this.#channel.guild.members.fetch();
        const nonBotMembers = members.filter((member) => !member.user.bot && member.id !== this.players[0]);
        if (nonBotMembers.size > 0) {
            while (nonBotMembers.size > 25) {
                const random = nonBotMembers.randomKey();
                if (random) {
                    nonBotMembers.delete(random);
                }
                // should never happen, but...
                else {
                    break;
                }
            }
            const userSelectMenu = new MessageSelectMenu()
                .setCustomId(`${this.#channel.id}:${this.players[0]}`) // ID of channel the game is in, then ID of the user who created the game, split by a colon
                .setPlaceholder("Challenge a user...");
            nonBotMembers.forEach((member) => {
                userSelectMenu.addOptions({
                    label: member.displayName,
                    value: member.id,
                    description: `${member.user.username}#${member.user.discriminator}`,
                    emoji: "🇺" // U+1F1FA -- U emoji for User
                });
            });
            this.#message.components.push(new MessageActionRow().addComponents(userSelectMenu));
        } else {
            this.#message = { content: "_Sorry, I couldn't find anyone on the server for you to play with!_" };
        }
    };

    #setupPlayerInvite = () => {
        if (!this.#message?.components) {
            return;
        }

        this.#message.content = `<@${this.players[0]}> vs. TBD (invitation for <@${this.players[1]}> pending)`;

        const acceptButton = new MessageButton()
            .setStyle("SUCCESS")
            .setCustomId(`${this.#channel.id}:${this.players[0]}:accept`) // ID of channel the game is in, then ID of the user who created the game, then "accept", split by a colon
            .setEmoji("✔");
        const declineButton = new MessageButton()
            .setStyle("DANGER")
            .setCustomId(`${this.#channel.id}:${this.players[0]}:decline`) // ID of channel the game is in, then ID of the user who created the game, then "decline", split by a colon
            .setEmoji("✖");

        const invitationRow = new MessageActionRow().addComponents([acceptButton, declineButton]);

        this.#message.components.push(invitationRow);
    };

    invitePlayer = async (newPlayerId: Snowflake, interaction: SelectMenuInteraction) => {
        if (!this.#message?.components) {
            return;
        }

        if (!this.players.includes(newPlayerId)) {
            this.players.push(newPlayerId);
        }

        this.#message.content = `<@${this.players[0]}> vs. TBD (invitation for <@${this.players[1]}> pending)`;

        const acceptButton = new MessageButton()
            .setStyle("SUCCESS")
            .setCustomId(`${this.#channel.id}:${this.players[0]}:accept`) // ID of channel the game is in, then ID of the user who created the game, then "accept", split by a colon
            .setEmoji("✔");
        const declineButton = new MessageButton()
            .setStyle("DANGER")
            .setCustomId(`${this.#channel.id}:${this.players[0]}:decline`) // ID of channel the game is in, then ID of the user who created the game, then "decline", split by a colon
            .setEmoji("✖");

        const invitationRow = new MessageActionRow().addComponents([acceptButton, declineButton]);

        this.#message.components.pop();
        this.#message.components.push(invitationRow);

        await interaction.update(this.#message);

        if (!(interaction.message instanceof Message)) {
            return;
        }

        this.#latestInvitation = await interaction.message.reply(
            `_<@${newPlayerId}> You've been invited to a game of Tic-Tac-Toe. Press the checkmark in the message above to accept, or the cross to decline._`
        );
    };

    acceptInvite = async (interaction: ButtonInteraction) => {
        if (!this.#message?.components) {
            return;
        }

        if (this.#latestInvitation) {
            await this.#latestInvitation.delete();
            this.#latestInvitation = null;
        }

        this.#message.content = `<@${this.players[0]}> vs. <@${this.players[1]}>`;
        this.#message.components.pop();

        await interaction.update(this.#message);

        await this.#startGame(interaction);
    };

    declineInvite = async (interaction: ButtonInteraction) => {
        if (!this.#message?.components) {
            return;
        }

        if (this.#latestInvitation) {
            await this.#latestInvitation.delete();
            this.#latestInvitation = null;
        }

        this.players.pop();

        this.#message.content = `<@${this.players[0]}> vs. TBD`;
        this.#message.components.pop();
        await this.#setupUserSelect();

        await interaction.update(this.#message);
    };

    #startGame = async (interaction: ButtonInteraction) => {
        if (!this.#message) {
            return;
        }

        this.#isGameActive = true;

        if (Math.random() < 0.5) {
            const last = this.players.pop();
            if (last) {
                this.players.unshift(last);
            }
        }

        this.#message.content = `**X:** _<@${this.players[0]}>_ vs. **O:** <@${this.players[1]}>`;

        if (!(interaction.message instanceof Message)) {
            return;
        }

        await interaction.message.edit(this.#message);
    };

    takeTurn = async (v: number, h: number, interaction: ButtonInteraction) => {
        if (!this.#message?.components) {
            return;
        }

        if (this.#board[v][h] !== null) {
            await interaction.reply({
                content: "_Your mark must be placed on an empty space!_",
                ephemeral: true
            });
            return;
        }

        if (this.isXTurn) {
            this.#board[v][h] = "x";
            this.#message.content = `**X:** <@${this.players[0]}> vs. **O:** _<@${this.players[1]}>_`;
        } else {
            this.#board[v][h] = "o";
            this.#message.content = `**X:** _<@${this.players[0]}>_ vs. **O:** <@${this.players[1]}>`;
        }
        const space = this.#board[v][h];

        this.isXTurn = !this.isXTurn;

        // check if anyone won
        let victory = false;
        const victories: TicTacToeSpace[][] = [];
        // rows
        for (const row of this.#board) {
            victories.push(row);
        }
        // columns
        for (let i = 0; i < this.#board.length; ++i) {
            victories.push([this.#board[0][i], this.#board[1][i], this.#board[2][i]]);
        }
        // diagonals
        victories.push(
            [this.#board[0][0], this.#board[1][1], this.#board[2][2]],
            [this.#board[0][2], this.#board[1][1], this.#board[2][0]]
        );
        // if any row, column, or diagonal has three of the same mark, then the player who placed the latest mark won
        if (victories.some((triplet) => triplet.every((element) => element === space))) {
            victory = true;
            this.#message.content = this.isXTurn
                ? `**X:** <@${this.players[0]}> vs. **O:** <@${this.players[1]}> 🏆`
                : `**X:** <@${this.players[0]}> 🏆 vs. **O:** <@${this.players[1]}>`;
        }

        // check for draw
        let draw = false;
        if (!this.#board.flat().includes(null) && !victory) {
            draw = true;
            this.#message.content = `**X:** <@${this.players[0]}> vs. **O:** <@${this.players[1]}> --- **DRAW**`;
        }

        const button = new MessageButton()
            .setStyle("SECONDARY")
            .setCustomId(`${this.#channel.id}:${this.players[0]}:${v},${h}`); // ID of channel the game is in, then ID of the user who created the game, then row index, then column index, split by a colon
        if (space) {
            button.setEmoji(this.#emoji[space]);
        }

        this.#message.components[v].components.splice(h, 1, button);

        const message = await interaction.update({ ...this.#message, fetchReply: true });

        if (victory || draw) {
            this.#isGameActive = false;
            const client = this.#interaction.client as ClientPlus;
            client.tictactoe.get(this.#channel.id)?.delete(this.players[0]);
            if (message instanceof Message) {
                if (victory) {
                    await message.reply(`<@${this.isXTurn ? this.players[1] : this.players[0]}> has won this game!`);
                } else {
                    await message.reply("This game has ended in a draw.");
                }
            }
        }
    };
}

export default TicTacToe;
