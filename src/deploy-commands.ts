import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import type { SlashCommandBuilder } from "@discordjs/builders";
import fs from "fs";
import winston from "winston";

import initialize from "./log.js";
import { isCommand } from "./types.js";

// initialize logger
initialize();

const commands: ReturnType<SlashCommandBuilder["toJSON"]>[] = [];
const commandFiles = fs.readdirSync("./build/commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const { default: command } = (await import(`./commands/${file}`)) as { default: unknown };
    if (!isCommand(command)) {
        winston.error(`Couldn't import a valid command from ./commands/${file}`);
        continue;
    }
    commands.push(command.data.toJSON());
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(process.env.DISCORD_TOKEN);

if (process.env.DISCORD_TOKEN) {
    const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

    client.guilds
        .fetch()
        .then((guilds) => {
            guilds.forEach((guild) => {
                if (client.user) {
                    rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands })
                        .then(() => {
                            winston.info(`Successfully registered application commands for guild ${guild.name}`);
                            client.destroy();
                        })
                        .catch(winston.error);
                }
            });
        })
        .catch(winston.error);
} else {
    throw Error;
}
