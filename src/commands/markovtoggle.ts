import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import { ChannelType } from "discord.js";
import winston from "winston";

import type ClientPlus from "../classes/ClientPlus";

export default {
    data: new SlashCommandBuilder()
        .setName("markovtoggle")
        .setDescription("Toggles posting of Markov chain-generated messages in current channel"),
    async execute(interaction: CommandInteraction) {
        const client = interaction.client as ClientPlus;
        const markov = client.markov.getMarkov();
        if (markov && Object.keys(markov).includes(interaction.channelId)) {
            client.markov.stopMarkovSpam(interaction.channelId);
            await interaction.reply("_I shouldn't shitpost in here any more? Fine..._");
        } else {
            if (interaction.channel?.type === ChannelType.GuildText) {
                client.markov.startMarkovSpam(interaction.channel);
                await interaction.reply("_Finally I can be myself again!_");
            } else {
                winston.error("Couldn't find channel to start Markov spam in");
            }
        }
    }
};
