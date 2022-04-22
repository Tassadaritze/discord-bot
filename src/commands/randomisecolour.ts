import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import ClientPlus from "../classes/ClientPlus";

export default {
    data: new SlashCommandBuilder()
        .setName("randomisecolour")
        .setDescription("Toggles randomising your name colour when you post a message (may get overridden by other roles)"),
    async execute(interaction: CommandInteraction) {
        const client = interaction.client as ClientPlus;
        if (interaction.guild) {
            // If user is on the list, and so is the guild that the interaction is called from, remove user and guild from list
            // Otherwise add user to list along with the guild that the interaction was called from (or just the guild if user is already on list)
            if
            (
                client.roles.roles.has(interaction.user.id) &&
                client.roles.roles.get(interaction.user.id)?.has(interaction.guild.id)
            )
            {
                client.roles.deleteUser(interaction.user, interaction.guild);
                await interaction.reply("_OK, I won't randomise your colour any more._");
            } else {
                client.roles.addUser(interaction.user, interaction.guild);
                await interaction.reply("_One step closer to turning this chat into a Christmas tree._");
            }
        } else {
            console.error("interaction.guild was null when adding/removing user to/from the role colour randomiser");
        }
    }
};