import type { ButtonInteraction, Interaction, SelectMenuInteraction } from "discord.js";
import { InteractionType } from "discord.js";
import winston from "winston";

import type ClientPlus from "../classes/ClientPlus.js";
import type TicTacToe from "../classes/TicTacToe.js";
import { isClientWithCommands, isCommand } from "../types.js";

export default {
    name: "interactionCreate",
    async execute(interaction: Interaction) {
        // thank you discord.js
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
            return;
        } else if (interaction.isSelectMenu()) {
            await handleSelectMenuInteraction(interaction);
            return;
        } else if (interaction.type !== InteractionType.ApplicationCommand) {
            return;
        }

        if (!isClientWithCommands(interaction.client)) {
            return;
        }

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command || !isCommand(command)) {
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            winston.error(error);
            await interaction.reply({
                content: "There was an error executing this command",
                ephemeral: true
            });
        }
    }
};

const handleButtonInteraction = async (interaction: ButtonInteraction) => {
    // console.log("[BUTTON INTERACTION]", interaction, interaction.customId);

    const client = interaction.client as ClientPlus;
    const [channelId, userId, action] = interaction.customId.split(":");

    const tictactoe = client.tictactoe.get(channelId)?.get(userId);

    // if game is not tracked on client, then we shouldn't be trying to do anything with it
    if (!tictactoe) {
        await interaction.reply({
            content: "_That game has already ended._",
            ephemeral: true
        });
        return;
    }

    if (action === "accept" || action === "decline") {
        await handleTicTacToeInvitation(interaction, tictactoe, action);
    } else {
        await handleTicTacToeMove(interaction, tictactoe, action);
    }
};

const handleTicTacToeInvitation = async (interaction: ButtonInteraction, tictactoe: TicTacToe, action: string) => {
    if (interaction.user.id !== tictactoe.players[1]) {
        await interaction.reply({
            content: "_You have not been invited to participate in this game!_",
            ephemeral: true
        });
        return;
    }

    switch (action) {
        case "accept": {
            await tictactoe.acceptInvite(interaction);
            break;
        }
        case "decline": {
            await tictactoe.declineInvite(interaction);
            break;
        }
        default: {
            winston.error("[ERROR] Got invalid value for tic-tac-toe action.");
            await interaction.reply({
                content: "_It seems like an error occurred._",
                ephemeral: true
            });
            return;
        }
    }
};

const handleTicTacToeMove = async (interaction: ButtonInteraction, tictactoe: TicTacToe, action: string) => {
    if (!tictactoe.players.includes(interaction.user.id)) {
        await interaction.reply({
            content: "_You are not a participant in this game!_",
            ephemeral: true
        });
        return;
    }

    if (
        (tictactoe.isXTurn && interaction.user.id === tictactoe.players[1]) ||
        (!tictactoe.isXTurn && interaction.user.id === tictactoe.players[0])
    ) {
        await interaction.reply({
            content: "_It's not your turn!_",
            ephemeral: true
        });
        return;
    }

    const [v, h] = action.split(",");
    await tictactoe.takeTurn(+v, +h, interaction);
};

const handleSelectMenuInteraction = async (interaction: SelectMenuInteraction) => {
    // console.log("[SELECT MENU INTERACTION]", interaction, interaction.customId);

    // the only current select menu has both minValues and maxValues of 1
    if (interaction.values.length !== 1) {
        winston.error("[ERROR] Length of select menu interaction value array is somehow not 1.");
        await interaction.reply({
            content: "_It seems like an error occurred._",
            ephemeral: true
        });
        return;
    }

    const client = interaction.client as ClientPlus;
    const [channelId, userId] = interaction.customId.split(":");

    const tictactoe = client.tictactoe.get(channelId)?.get(userId);

    // if game is not tracked on client, then we shouldn't be trying to do anything with it
    if (!tictactoe) {
        await interaction.reply({
            content: "_That game has already ended._",
            ephemeral: true
        });
        return;
    }

    // only the user who created the game may invite players
    if (tictactoe.players[0] !== interaction.user.id) {
        await interaction.reply({
            content: "_Only the game owner may invite players!_",
            ephemeral: true
        });
        return;
    }

    try {
        await tictactoe.invitePlayer(interaction.values[0], interaction);
    } catch (e) {
        winston.error(e);
        await interaction.reply({
            content: "_It seems like an error occurred._",
            ephemeral: true
        });
    }
};
