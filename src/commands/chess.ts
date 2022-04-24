import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("chess")
        .setDescription("Starts a chess game"),
    async execute(interaction: CommandInteraction) {
        // code goes here :^)
    }
}