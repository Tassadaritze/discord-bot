import "dotenv/config";
import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import fs from "fs";
import winston from "winston";

import initialize from "./log.js";

// initialize logger
initialize();

const commands: SlashCommandBuilder[] = [];
const commandFiles = fs.readdirSync("./build/commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const { default:command } = await import(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
await client.login(process.env.DISCORD_TOKEN);

if (process.env.DISCORD_TOKEN) {
    const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

    client.guilds.fetch()
        .then(guilds => {
            guilds.forEach(guild => {
                if (client.user)
                    rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands })
                        .then(() => {
                            winston.info(`Successfully registered application commands for guild ${guild.name}`);
                            client.destroy();
                        })
                        .catch(winston.error);
            })
        })
        .catch(winston.error);
} else {
    throw TypeError;
}
