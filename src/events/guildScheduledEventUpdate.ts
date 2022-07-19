import type { GuildScheduledEvent } from "discord.js";
import { GuildScheduledEventStatus } from "discord.js";
import winston from "winston";

import type ClientPlus from "../classes/ClientPlus";
import { toUTC } from "./guildScheduledEventCreate";

export default {
    name: "guildScheduledEventUpdate",
    execute(oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent) {
        const client = oldGuildScheduledEvent.client as ClientPlus;
        if (
            newGuildScheduledEvent.status === GuildScheduledEventStatus.Scheduled &&
            oldGuildScheduledEvent.scheduledStartAt !== newGuildScheduledEvent.scheduledStartAt &&
            newGuildScheduledEvent.guildId === client.eventReportChannel?.guildId
        ) {
            if (oldGuildScheduledEvent.scheduledStartAt && newGuildScheduledEvent.scheduledStartAt) {
                client.eventReportChannel
                    ?.send(
                        `Event **${newGuildScheduledEvent.name},** previously scheduled for ${toUTC(
                            oldGuildScheduledEvent.scheduledStartAt.toUTCString()
                        )}, will now start at **${toUTC(newGuildScheduledEvent.scheduledStartAt.toUTCString())}.**`
                    )
                    .catch(winston.error);
            } else if (newGuildScheduledEvent.scheduledStartAt) {
                client.eventReportChannel
                    ?.send(
                        `Event **${newGuildScheduledEvent.name}** will now start at **${toUTC(
                            newGuildScheduledEvent.scheduledStartAt.toUTCString()
                        )}.**`
                    )
                    .catch(winston.error);
            } else if (oldGuildScheduledEvent.scheduledStartAt) {
                client.eventReportChannel
                    ?.send(
                        `Event **${newGuildScheduledEvent.name},** previously scheduled for ${toUTC(
                            oldGuildScheduledEvent.scheduledStartAt.toUTCString()
                        )}, **no longer has a start time.**`
                    )
                    .catch(winston.error);
            }
        }
    }
};
