import "../env/env.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const commands = [
    new SlashCommandBuilder().setName("ping").setDescription("Do I really need to explain")
]
    .map(command => command.toJSON());

if (process.env.DISCORD_TOKEN !== undefined
    && process.env.CLIENT_ID !== undefined
    && process.env.DEV_GUILD_ID !== undefined) {
    const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID), { body: commands })
        .then(() => console.log("Successfully registered application commands"))
        .catch(console.error);
} else {
    throw TypeError;
}