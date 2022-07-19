import type { GuildScheduledEvent } from "discord.js";
import winston from "winston";

import type ClientPlus from "../classes/ClientPlus";
import { toUTC } from "./guildScheduledEventCreate";

export default {
    name: "guildScheduledEventDelete",
    execute(guildScheduledEvent: GuildScheduledEvent) {
        const client = guildScheduledEvent.client as ClientPlus;
        if (guildScheduledEvent.guildId === client.eventReportChannel?.guildId) {
            client.eventReportChannel
                ?.send(
                    guildScheduledEvent.scheduledStartAt
                        ? `Event **${guildScheduledEvent.name},** previously scheduled for ${toUTC(
                              guildScheduledEvent.scheduledStartAt.toUTCString()
                          )}, was **cancelled.**`
                        : `Event **${guildScheduledEvent.name}** was **cancelled.**`
                )
                .catch(winston.error);
        }
    }
};
