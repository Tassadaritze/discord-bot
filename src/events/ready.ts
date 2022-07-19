import { ChannelType } from "discord.js";
import winston from "winston";

import type ClientPlus from "../classes/ClientPlus.js";

export default {
    name: "ready",
    once: true,
    execute(client: ClientPlus) {
        if (client.user) {
            winston.info(`Ready! Logged in as ${client.user.tag}`);
            client.channels
                .fetch("464502359372857355")
                .then((channel) => {
                    if (channel?.type === ChannelType.GuildText) {
                        client.markov.startMarkovSpam(channel);
                    }
                })
                .catch(winston.error);
            client.channels
                .fetch("924343631761006592")
                .then((channel) => {
                    if (channel?.type === ChannelType.GuildText) {
                        client.eventReportChannel = channel;
                    }
                })
                .catch(winston.error);
        } else {
            throw new Error();
        }
    }
};
