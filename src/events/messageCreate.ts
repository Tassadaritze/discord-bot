import { Message } from "discord.js";

import ClientPlus from "../classes/ClientPlus";

export default {
    name: "messageCreate",
    execute(message: Message) {
        const client = message.client as ClientPlus;
        if (
            message.author.id !== client.user?.id &&
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
