import {
    ButtonInteraction,
    Client,
    Collection,
    CommandInteraction,
    Interaction,
    SelectMenuInteraction
} from "discord.js";
import ClientPlus from "../classes/ClientPlus.js";


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
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
            return;
        } else if (interaction.isSelectMenu()) {
            await handleSelectMenuInteraction(interaction);
            return;
        } else if (!interaction.isCommand())
            return;

        if (!isClientWithCommands(interaction.client))
            return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command || !isCommand(command))
            return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error executing this command", ephemeral: true });
        }
    }
}

const handleButtonInteraction = async (interaction: ButtonInteraction) => {
    console.log("[BUTTON INTERACTION]", interaction, interaction.customId);
    await interaction.reply({ content: "_Success!_", ephemeral: true });
}

const handleSelectMenuInteraction = async (interaction: SelectMenuInteraction) => {
    console.log("[SELECT MENU INTERACTION]", interaction, interaction.customId);

    // the only current select menu has both minValues and maxValues of 1
    if (interaction.values.length !== 1) {
        console.error("[ERROR] Length of select menu interaction value array is somehow not 1.");
        await interaction.reply({ content: "_It seems like an error occurred._", ephemeral: true });
        return;
    }

    const client = interaction.client as ClientPlus;
    const [channelId, userId] = interaction.customId.split(":");

    // if game is not tracked on client, then we shouldn't be trying to do anything with it
    if (!client.tictactoe.has(channelId) || !client.tictactoe.get(channelId)?.has(userId)) {
        console.error("[ERROR] Tried to invite player to an untracked tic-tac-toe game.");
        await interaction.reply({ content: "_It seems like an error occurred._", ephemeral: true });
        return;
    }

    const user = await interaction.client.users.fetch(userId);

    await interaction.reply({ content: "_Success!_", ephemeral: true });
}