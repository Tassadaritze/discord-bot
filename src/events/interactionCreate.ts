import { Client, Collection, CommandInteraction, Interaction } from "discord.js";


export type Command = {
    execute: (arg0: CommandInteraction) => Promise<void>
}

function isCommand(test: unknown): test is Command {
    return (test as Command).execute !== undefined;
}

interface ClientWithCommands extends Client {
    commands: Collection<string, Command>
}

function isClientWithCommands(client: unknown): client is ClientWithCommands {
    return (client as ClientWithCommands).commands !== undefined;
}


export default {
    name: "interactionCreate",
    async execute(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        if (!isClientWithCommands(interaction.client)) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command || !isCommand(command)) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error executing this command", ephemeral: true });
        }
    }
}