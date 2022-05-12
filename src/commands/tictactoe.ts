import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import TicTacToe from "../classes/TicTacToe.js";
import ClientPlus from "../classes/ClientPlus.js";

export default {
    data: new SlashCommandBuilder()
        .setName("tictactoe")
        .setDescription("Starts a game of tic-tac-toe")
        .addUserOption(
            new SlashCommandUserOption()
                .setName("opponent")
                .setDescription("Pick your opponent (omit to let someone join later)")),
    async execute(interaction: CommandInteraction) {
        const opponent = interaction.options.getUser("opponent");

        /*
        if (opponent?.bot) {
            await interaction.reply("_You can't challenge a bot!_");
            return;
        }

         */

        const client = interaction.client as ClientPlus;
        if (interaction.channel && client.tictactoe.has(interaction.channel.id) && client.tictactoe.get(interaction.channel.id)?.has(interaction.user.id)) {
            await interaction.reply("_You already have a game running in this channel!_");
            return;
        }

        let tictactoe: TicTacToe;
        if (opponent)
            tictactoe = new TicTacToe([interaction.user.id, opponent.id], interaction);
        else
            tictactoe = new TicTacToe([interaction.user.id], interaction);
    }
}