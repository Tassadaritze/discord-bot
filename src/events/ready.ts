import { TextChannel } from "discord.js";
import ClientPlus from "../classes/ClientPlus";
import startMarkovSpam from "../markov.js";

export default {
    name: "ready",
    once: true,
    execute(client: ClientPlus) {
        if (client.user) {
            console.log(`Ready! Logged in as ${client.user.tag}`);
            startMarkovSpam(client)
                .then(markovTimer => client.markov = markovTimer);
            client.channels.fetch("924343631761006592")
                .then(channel => {
                    if (channel instanceof TextChannel) client.eventReportChannel = channel;
                });
        } else {
            throw TypeError;
        }
    }
}