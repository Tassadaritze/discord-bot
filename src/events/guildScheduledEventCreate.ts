import { GuildScheduledEvent } from "discord.js";
import ClientPlus from "../classes/ClientPlus";

export default {
    name: "guildScheduledEventCreate",
    async execute(guildScheduledEvent: GuildScheduledEvent) {
        const client = guildScheduledEvent.client as ClientPlus;
        if (guildScheduledEvent.guildId === client.eventReportChannel?.guildId)
            client.eventReportChannel?.send(`Event **${guildScheduledEvent.name}** was scheduled for **${guildScheduledEvent.scheduledStartAt.toUTCString()}**.`);
    }
}
