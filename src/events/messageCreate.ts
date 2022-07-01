import type { Message } from "discord.js";
import winston from "winston";

import ClientPlus from "../classes/ClientPlus";

export default {
    name: "messageCreate",
    execute(message: Message) {
        const client = message.client as ClientPlus;
        if (!client.user?.id) {
            return;
        }

        if (message.author.id !== client.user.id && message.mentions.users.has(client.user.id)) {
            message.reply(client.markov.generate()).catch(winston.error);
        } else if (
            message.author.id !== client.user.id &&
            ["DEFAULT", "REPLY"].includes(message.type) &&
            message.content.length > 0
        ) {
            client.markov.addString(message.content);
        }

        if (client.roles.roles.has(message.author.id) && message.guild) {
            client.roles.randomise(message.author, message.guild);
        }
    }
};
