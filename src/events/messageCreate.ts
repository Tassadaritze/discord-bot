import { Message } from "discord.js";
import ClientPlus from "../classes/ClientPlus";

export default {
    name: "messageCreate",
    async execute(message: Message) {
        const client = message.client as ClientPlus;
        if (message.author.id !== client.user?.id)
            client.markov.addString(message.content);
        if (client.roles.roles && Object.keys(client.roles.roles).includes(message.author.id) && message.guild)
            client.roles.randomise(message.author, message.guild);
    }
}
