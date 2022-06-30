/*
import "dotenv/config";
import fsPromises from "fs/promises";
import { Client, Collection, Intents, Message, Snowflake, TextChannel } from "discord.js";
import winston from "winston";

import initialize from "./log.js";

// initialize logger
initialize();

// TODO: remake message dumper in a better way
const getChannelMessages = async (channel: TextChannel): Promise<string[]> => {
    let channelMessages: Collection<string, Message> = new Collection<string, Message>();

    let oldest: Snowflake = "916102820132978710";

    while (true) {
        const messages = await channel.messages.fetch({ limit: 100, before: oldest });
        const oldestMessage = messages.lastKey();
        if (oldestMessage) {
            oldest = oldestMessage;
            messages.delete(oldestMessage);
        }
        if (messages.size === 0) {break;}
        channelMessages = channelMessages.concat(messages);
    }

    return channelMessages.map((message) => message.content + "\n");
};


if (process.env.DISCORD_TOKEN !== undefined) {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    await client.login();
    await client.on("ready", () => { winston.info("Client ready"); });

    const startedAt = Date.now();

    if (process.env.GUILD_ID !== undefined) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        let channels;
        if (guild) {channels = await guild.channels.fetch();}

        let textChannels;
        if (channels) {textChannels = channels.filter((channel) => channel instanceof TextChannel);}

        if (textChannels) {
            for (const channel of textChannels) {
                if (channel[1] instanceof TextChannel) {
                    const messages = await getChannelMessages(channel[1]);
                    winston.info(messages);
                    const messageString = messages.join("");
                    fsPromises.appendFile("message-dump.txt", messageString, "utf8");
                }
            }
            const timeElapsed = Date.now() - startedAt;
            winston.info(`Dumping messages finished in ${timeElapsed}ms`);
        }
    }
} else {
    throw TypeError;
}
*/
