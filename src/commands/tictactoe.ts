import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("tictactoe")
        .setDescription("Starts a game of tic-tac-toe")
        .addUserOption(
            new SlashCommandUserOption()
                .setName("opponent")
                .setDescription("Pick your opponent (omit to let someone join later)")),
    async execute(interaction: CommandInteraction) {
        // Put code here :^)
    }
}