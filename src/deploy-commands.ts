import "../env/env.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";

const commands = [];
const commandFiles = fs.readdirSync("./build/commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const { default:command } = await import(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

if (process.env.DISCORD_TOKEN !== undefined
    && process.env.CLIENT_ID !== undefined
    && process.env.GUILD_ID !== undefined) {

    const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
        .then(() => console.log("Successfully registered application commands"))
        .catch(err => console.error(err));
} else {
    throw TypeError;
}