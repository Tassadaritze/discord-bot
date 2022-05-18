import { GuildScheduledEvent } from "discord.js";
import ClientPlus from "../classes/ClientPlus";

export default {
    name: "guildScheduledEventCreate",
    async execute(guildScheduledEvent: GuildScheduledEvent) {
        const client = guildScheduledEvent.client as ClientPlus;
        if (guildScheduledEvent.guildId === client.eventReportChannel?.guildId)
            client.eventReportChannel?.send(`Event **${guildScheduledEvent.name}** was scheduled for **${toUTC(guildScheduledEvent.scheduledStartAt.toUTCString())}.**`);
    }
}

// I swear I'm not obsessed with hating GMT
export const toUTC = (gmtString: string): string => {
    return gmtString.substring(0, gmtString.length - 3) + "UTC";
}