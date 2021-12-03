import "../env/env.js";
import fsPromises from "fs/promises";
import { Client, Collection, Intents, Message, Snowflake, TextChannel } from "discord.js";


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
        if (messages.size === 0) break;
        channelMessages = channelMessages.concat(messages);
    }

    return channelMessages.map(message => message.content + "\n");
};


if (process.env.DISCORD_TOKEN !== undefined) {

    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    await client.login();
    await client.on("ready", () => console.log("Client ready"));

    const startedAt = Date.now();

    /*
    const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

    let textChannels: { id: Snowflake, type: number }[] = [];

    const channels = await rest.get(Routes.guildChannels(process.env.GUILD_ID))
        .catch(err => console.error(err, "Unable to retrieve guild channel list"));

    if (Array.isArray(channels)) textChannels = channels.filter(channel => channel.type === 0);  // Only retrieve guild text channels
    else throw TypeError;
     */

    if (process.env.GUILD_ID !== undefined) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        let channels;
        if (guild) channels = await guild.channels.fetch();

        let textChannels;
        if (channels) textChannels = channels.filter(channel => channel instanceof TextChannel);

        if (textChannels) {
            for (const channel of textChannels) {
                if (channel[1] instanceof TextChannel) {
                    const messages = await getChannelMessages(channel[1]);
                    console.log(messages);
                    const messageString = messages.join("");
                    fsPromises.appendFile("message-dump.txt", messageString, "utf8");
                }
            }
            const timeElapsed = Date.now() - startedAt;
            console.log(`Dumping messages finished in ${timeElapsed}ms`);
        }

    }

    /*
for (const channel of textChannels) {
    let userMessages: { type: number, content: string }[] = [];

    let oldest: Snowflake = "";

    let messages: unknown;

    while (true) {
        if (oldest) {
            messages = await rest.get(`${Routes.channelMessages(channel.id)}?limit=${100}&before=${oldest}`)
                .catch(err => console.error(err, `Unable to retrieve messages for channel with id ${channel.id}`));
        } else {
            messages = await rest.get(`${Routes.channelMessages(channel.id)}?limit=${100}`)
                .catch(err => console.error(err, `Unable to retrieve messages for channel with id ${channel.id}`));
        }

        if (Array.isArray(messages)) {
            if (oldest) messages.shift();
            if (!messages.length) break;
            userMessages = messages.filter(message => message.type === 0 || message.type === 19);
            oldest = messages.reduce((prev, curr) => {
                if (+curr.id < +prev.id) return curr;
                else return prev;
            }).id;
        }

        userMessageContent = userMessageContent.concat(userMessages.map(message => message.content + "\n"));
        await new Promise(r => setTimeout(r, 1500));  // Wait 1,5 seconds to avoid rate limit
    }
    }
     */

} else {
    throw TypeError;
}