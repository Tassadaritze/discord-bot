import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";
import TicTacToe from "../classes/TicTacToe.js";

export default {
    data: new SlashCommandBuilder()
        .setName("tictactoe")
        .setDescription("Starts a game of tic-tac-toe")
        .addUserOption(
            new SlashCommandUserOption()
                .setName("opponent")
                .setDescription("Pick your opponent (omit to let someone join later)")),
    async execute(interaction: CommandInteraction) {
        let tictactoe: TicTacToe;
        const opponent = interaction.options.getUser("opponent");
        if (interaction.channel instanceof TextChannel) {
            if (opponent)
                tictactoe = new TicTacToe([interaction.user, opponent], interaction.channel);
            else
                tictactoe = new TicTacToe([interaction.user], interaction.channel);
        } else {
            console.error("[ERROR] interaction.channel is not an instance of TextChannel");
        }
        await interaction.reply("Match time!");
    }
}