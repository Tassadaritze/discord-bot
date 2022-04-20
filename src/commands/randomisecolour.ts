import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import ClientPlus from "../classes/ClientPlus";

export default {
    data: new SlashCommandBuilder()
        .setName("randomisecolour")
        .setDescription("Toggles randomising your name colour when you post a message (may get overridden by other roles)"),
    async execute(interaction: CommandInteraction) {
        const client = interaction.client as ClientPlus;
        const roles = client.roles.roles;
        if (roles && Object.keys(roles).includes(interaction.user.id)) {
            client.roles.deleteUser(interaction.user, client);
            await interaction.reply("_OK, I won't randomise your colour any more._");
        } else {
            if (interaction.guild) {
                client.roles.addUser(interaction.user, interaction.guild);
                await interaction.reply("_One step closer to turning this chat into a Christmas tree._");
            } else {
                console.error("interaction.guild was null when adding user to the role colour randomiser");
            }
        }
    }
}