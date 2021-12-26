import { GuildScheduledEvent } from "discord.js";
import ClientPlus from "../classes/ClientPlus";

export default {
    name: "guildScheduledEventUpdate",
    async execute(oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent) {
        const client = oldGuildScheduledEvent.client as ClientPlus;
        if (
            newGuildScheduledEvent.status === "SCHEDULED" &&
            oldGuildScheduledEvent.scheduledStartAt !== newGuildScheduledEvent.scheduledStartAt
        ) {
            client.eventReportChannel?.send(`Event **${newGuildScheduledEvent.name}**, previously scheduled for ${oldGuildScheduledEvent.scheduledStartAt.toUTCString()} will now start at **${newGuildScheduledEvent.scheduledStartAt.toUTCString()}**.`);
        }
    }
}
