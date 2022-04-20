import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import ClientPlus from "../classes/ClientPlus";

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
            if (interaction.channel) {
                client.markov.startMarkovSpam(client, interaction.channel);
                await interaction.reply("_Finally I can be myself again!_");
            } else {
                console.error("Couldn't find channel to start Markov spam in");
            }
        }
    }
}