import "dotenv/config";
import fs from "fs";
import { GatewayIntentBits } from "discord.js";
import winston from "winston";

import ClientPlus from "./classes/ClientPlus.js";
import initialize from "./log.js";
import { isCommand, isEvent } from "./types.js";

// initialize logger
initialize();

const client = new ClientPlus({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildScheduledEvents
    ]
});

const commandFiles = fs.readdirSync("./build/commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const { default: command } = (await import(`./commands/${file}`)) as { default: unknown };
    if (!isCommand(command)) {
        winston.error(`Couldn't import a valid command from ./commands/${file}`);
        continue;
    }
    client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync("./build/events").filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
    const { default: event } = (await import(`./events/${file}`)) as { default: unknown };
    if (!isEvent(event)) {
        winston.error(`Couldn't import a valid event from ./events/${file}`);
        continue;
    }
    if (event.name === "debug" && !process.argv.includes("debug")) {
        winston.info("Skipping debug event as debug argument was not provided");
        continue;
    }
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...(args as unknown[])));
    } else {
        client.on(event.name, (...args) => event.execute(...(args as unknown[])));
    }
}

client.login().catch(winston.error);
