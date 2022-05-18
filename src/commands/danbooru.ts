import "../../env/env.js";
import fetch from "node-fetch";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";

// making a class for this one seems unnecessary, so I won't
export default {
    data: new SlashCommandBuilder()
        .setName("danbooru")
        .setDescription("Post a random image with given tag from Danbooru (may be NSFW if used in an NSFW channel)")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("tag")
                .setDescription("Tag to search (omit for a random image)")),
    async execute(interaction: CommandInteraction) {
        let tag = interaction.options.get("tag")?.value;
        if (typeof tag === "string")
            tag = tag.trim().replaceAll(" ", "_");

        let response;
        const nsfw = interaction.channel instanceof TextChannel && interaction.channel.nsfw;
        if (nsfw)
            response = await fetch(`https://danbooru.donmai.us/posts/random.json?${tag ? `tags=${tag}&` : ""}login=${process.env.DANBOORU_USERNAME}&api_key=${process.env.DANBOORU_API_KEY}`);
        else
            response = await fetch(`https://danbooru.donmai.us/posts/random.json?tags=rating:safe${tag ? `+${tag}` : ""}&login=${process.env.DANBOORU_USERNAME}&api_key=${process.env.DANBOORU_API_KEY}`);

        let data = await response.json();
        if (!isPostData(data)) {
            await interaction.reply(`_Danbooru has returned an error.${!nsfw ? " (Trying this again in an NSFW channel might help.)" : ""}_`);
            return;
        }

        const image = data.file_size > 8 * 1024 * 1024 ? sanitize(data.large_file_url) : sanitize(data.file_url);    // 8 MiB
        await interaction.reply({
            content: image ? undefined : "_Couldn't download image from unsafe URL._",
            files: image ? [image] : undefined
        });
    }
}

const sanitize = (url: string): string | null => {
    const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;

    if (url.match(SAFE_URL_PATTERN)) return url;
    else return null;
}

type PostData = {
    file_size: number,
    file_url: string,
    large_file_url: string
}

const isPostData = (object: any): object is PostData => {
    return !!(object.file_size && object.file_url && object.large_file_url);
}