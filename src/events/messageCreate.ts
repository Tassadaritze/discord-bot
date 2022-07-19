import type { Message } from "discord.js";
import { MessageType } from "discord.js";
import winston from "winston";

import type ClientPlus from "../classes/ClientPlus.js";

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
            [MessageType.Default, MessageType.Reply].includes(message.type) &&
            message.content.length > 0
        ) {
            client.markov.addString(message.content);
        }

        if (client.roles.roles.has(message.author.id) && message.guild) {
            client.roles.randomise(message.author, message.guild);
        }
    }
};
