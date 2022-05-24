import "../env/env.js";
import fs from "fs";
import { Intents } from "discord.js";
import winston from "winston";
import ClientPlus from "./classes/ClientPlus.js";
import initialize from "./log.js";

initialize();    // initialize logger

const client = new ClientPlus({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS] });

const commandFiles = fs.readdirSync("./build/commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const { default:command } = await import(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync("./build/events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const { default:event } = await import(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login()
    .catch(winston.error);