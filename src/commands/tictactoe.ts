import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import { ChannelType } from "discord.js";

import TicTacToe from "../classes/TicTacToe";
import type ClientPlus from "../classes/ClientPlus";

export default {
    data: new SlashCommandBuilder()
        .setName("tictactoe")
        .setDescription("Starts a game of tic-tac-toe")
        .addUserOption(
            new SlashCommandUserOption()
                .setName("opponent")
                .setDescription("Pick your opponent (omit to let someone join later)")
        ),
    async execute(interaction: CommandInteraction) {
        if (interaction.channel?.type !== ChannelType.GuildText) {
            await interaction.reply("_This command must be used in a server text channel._");
            return;
        }

        const opponent = interaction.options.getUser("opponent");

        if (opponent?.bot) {
            await interaction.reply("_You can't challenge a bot!_");
            return;
        }

        if (opponent?.id === interaction.user.id) {
            await interaction.reply("_You can't challenge yourself! (although you should)_");
            return;
        }

        const client = interaction.client as ClientPlus;
        if (
            client.tictactoe.has(interaction.channel.id) &&
            client.tictactoe.get(interaction.channel.id)?.has(interaction.user.id)
        ) {
            await interaction.reply("_You already have a game running in this channel!_");
            return;
        }

        new TicTacToe(interaction.user, interaction, interaction.channel, opponent);
    }
};
