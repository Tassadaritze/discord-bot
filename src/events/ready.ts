import { TextChannel } from "discord.js";
import winston from "winston";

import ClientPlus from "../classes/ClientPlus";

export default {
    name: "ready",
    once: true,
    execute(client: ClientPlus) {
        if (client.user) {
            winston.info(`Ready! Logged in as ${client.user.tag}`);
            client.channels
                .fetch("464502359372857355")
                .then((channel) => {
                    if (channel instanceof TextChannel) {
                        client.markov.startMarkovSpam(channel);
                    }
                })
                .catch(winston.error);
            client.channels
                .fetch("924343631761006592")
                .then((channel) => {
                    if (channel instanceof TextChannel) {
                        client.eventReportChannel = channel;
                    }
                })
                .catch(winston.error);
        } else {
            throw TypeError;
        }
    }
};
