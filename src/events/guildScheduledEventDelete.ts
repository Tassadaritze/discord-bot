import { GuildScheduledEvent } from "discord.js";
import ClientPlus from "../classes/ClientPlus";
import { toUTC } from "./guildScheduledEventCreate.js";

export default {
    name: "guildScheduledEventDelete",
    async execute(guildScheduledEvent: GuildScheduledEvent) {
        const client = guildScheduledEvent.client as ClientPlus;
        if (guildScheduledEvent.guildId === client.eventReportChannel?.guildId)
            client.eventReportChannel?.send(`Event **${guildScheduledEvent.name},** previously scheduled for ${toUTC(guildScheduledEvent.scheduledStartAt.toUTCString())}, was **cancelled.**`);
    }
}
