import { GuildScheduledEvent } from "discord.js";
import winston from "winston";

import ClientPlus from "../classes/ClientPlus";
import { toUTC } from "./guildScheduledEventCreate.js";

export default {
    name: "guildScheduledEventUpdate",
    execute(oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent) {
        const client = oldGuildScheduledEvent.client as ClientPlus;
        if (
            newGuildScheduledEvent.status === "SCHEDULED" &&
            oldGuildScheduledEvent.scheduledStartAt !== newGuildScheduledEvent.scheduledStartAt &&
            newGuildScheduledEvent.guildId === client.eventReportChannel?.guildId
        ) {
            client.eventReportChannel
                ?.send(
                    `Event **${newGuildScheduledEvent.name},** previously scheduled for ${toUTC(
                        oldGuildScheduledEvent.scheduledStartAt.toUTCString()
                    )}, will now start at **${toUTC(newGuildScheduledEvent.scheduledStartAt.toUTCString())}.**`
                )
                .catch(winston.error);
        }
    }
};
