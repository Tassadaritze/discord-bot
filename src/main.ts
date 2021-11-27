import "../env/env.js";
import { Client, Collection, CommandInteraction, Intents } from "discord.js";
import fs from "fs";


type Command = {
    execute: (arg0: CommandInteraction) => Promise<void>
}

function isCommand(test: unknown): test is Command {
    return (test as Command).execute !== undefined;
}


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = new Collection();
const commandFiles = fs.readdirSync("./build/commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const { default:command } = await import(`./commands/${file}`);
    commands.set(command.data.name, command);
}

client.once("ready", () => console.log("Ready!"));

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command || !isCommand(command)) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command", ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN)
    .catch(err => console.error(err));