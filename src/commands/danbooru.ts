import "../../env/env.js";
import fetch, { Response } from "node-fetch";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";
import winston from "winston";

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
        await interaction.deferReply();

        let tag = interaction.options.get("tag")?.value;
        if (typeof tag === "string")
            tag = tag.trim().replaceAll(" ", "_");

        const nsfw = interaction.channel instanceof TextChannel && interaction.channel.nsfw;
        const response = await fetch(`https://danbooru.donmai.us/posts/random.json?tags=${!nsfw ? "rating:safe" : ""}${tag ? `+${tag}` : ""}&login=${process.env.DANBOORU_USERNAME}&api_key=${process.env.DANBOORU_API_KEY}`)
            .catch(winston.error);

        let data;
        if (response instanceof Response)
            data = await response.json();
        winston.info(data);
        if (!isPostData(data)) {
            interaction.editReply(`**${tag ? `${tag}`.replaceAll("_", "\\_") : "random"}:** _Danbooru has returned an error.${!nsfw ? " (Trying this again in an NSFW channel might help.)" : ""}_`)
                .catch(winston.error);
            return;
        }

        const image = data.file_size > 8 * 1024 * 1024 ? sanitize(data.large_file_url) : sanitize(data.file_url);    // 8 MiB
        if (data.file_size > 8 * 1024 * 1024 && data.large_file_url === data.file_url) {
            interaction.editReply(`**${tag ? `${tag}`.replaceAll("_", "\\_") : "random"}:** _Image too large, posting link instead:_`)
                .catch(winston.error);
            if (interaction.channel)
                await interaction.channel.send(data.file_url);
            return;
        }

        interaction.editReply({
            content: image ? `**${tag ? `${tag}`.replaceAll("_", "\\_") : "random"}:**` : "_Couldn't download image from unsafe URL._",
            files: image ? [image] : undefined
        }).catch(winston.error);
    }
};

const sanitize = (url: string): string | null => {
    const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;

    if (url.match(SAFE_URL_PATTERN)) return url;
    else return null;
};

type PostData = {
    file_size: number,
    file_url: string,
    large_file_url: string
}

const isPostData = (object: any): object is PostData => {
    return !!(object.file_size && object.file_url && object.large_file_url);
};