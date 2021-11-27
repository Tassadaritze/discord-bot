import "../env/env.js";
import { Client, ClientOptions, Collection, Intents } from "discord.js";
import fs from "fs";
import { Command } from "./events/interactionCreate";


class ClientWithCommands extends Client {
    commands: Collection<string, Command> = new Collection<string, Command>();

    constructor(props: ClientOptions) {
        super(props);
    }
}


const client = new ClientWithCommands({ intents: [Intents.FLAGS.GUILDS] });

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

client.login(process.env.DISCORD_TOKEN)
    .catch(err => console.error(err));