import { TextChannel } from "discord.js";
import ClientPlus from "../classes/ClientPlus";

export default {
    name: "ready",
    once: true,
    execute(client: ClientPlus) {
        if (client.user) {
            console.log(`Ready! Logged in as ${client.user.tag}`);
            client.channels.fetch("464502359372857355")
                .then(channel => {
                    if (channel)
                        client.markov.startMarkovSpam(client, channel);
                });
            client.channels.fetch("924343631761006592")
                .then(channel => {
                    if (channel instanceof TextChannel) client.eventReportChannel = channel;
                });
        } else {
            throw TypeError;
        }
    }
}