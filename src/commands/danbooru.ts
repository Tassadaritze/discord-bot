import "../../env/env.js";
import fetch from "node-fetch";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";
import winston from "winston";
import * as fs from "fs";

const _8_MIB = 8 * 1024 * 1024;

type PostData = {
    file_size: number,
    file_url: string,
    large_file_url: string
}

const isPostData = (object: any): object is PostData => {
    return !!(object.file_size && object.file_url && object.large_file_url);
};

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

        if (!process.env.DANBOORU_USERNAME
            || !process.env.DANBOORU_API_KEY) {
            await interaction.editReply("_The environment variables DANBOORU_USERNAME and DANBOORU_API_KEY " +
                "must be set to enable usage of this command._");
            return;
        }

        let nsfw: "nsfw" | "sensitive" | "off" = "off";
        if ((interaction.channel as TextChannel).nsfw) {
            nsfw = "nsfw";
        } else {
            try {
                const general = JSON.parse(fs.readFileSync("./storage/general.json", "utf-8"));
                if (Array.isArray(general.whitelist) && general.whitelist.includes(interaction.channelId)) {
                    nsfw = "sensitive";
                }
            }
            catch (e) {
                winston.error("Error trying to read ./storage/general.json")
                    .error(e);
            }
        }

        const params = new URLSearchParams({
            login: process.env.DANBOORU_USERNAME,
            api_key: process.env.DANBOORU_API_KEY
        });

        let tag = interaction.options.get("tag")?.value;
        if (typeof tag === "string") {
            tag = tag.trim().replaceAll(" ", "_");
        }

        switch (nsfw) {
            case "nsfw": {
                if (tag && typeof tag === "string") {
                    params.set("tags", tag);
                }
                break;
            }
            case "sensitive": {
                tag && typeof tag === "string"
                ? params.set("tags", `(rating:general ${tag}) or (rating:sensitive ${tag})`)
                : params.set("tags", "rating:general or rating:sensitive");
                break;
            }
            default: {
                tag && typeof tag === "string"
                ? params.set("tags", `rating:general ${tag}`)
                : params.set("tags", "rating:general");
            }
        }

        let response;
        try {
            response = await fetch(`https://danbooru.donmai.us/posts/random.json?${params.toString()}`);
        }
        catch (e) {
            winston.error(e);
            interaction.editReply(`**${tag ? `${tag}`.replaceAll("_", "\\_") : "random"}:** _Couldn't connect to Danbooru._`)
                .catch(winston.error);
            return;
        }

        const data = await response.json();
        winston.info(data);
        if (!isPostData(data)) {
            interaction.editReply(`**${tag ? `${tag}`.replaceAll("_", "\\_") : "random"}:** _Danbooru has returned an error.${!nsfw ? " (Trying this again in an NSFW channel might help.)" : ""}_`)
                .catch(winston.error);
            return;
        }

        const image = data.file_size > _8_MIB ? sanitize(data.large_file_url) : sanitize(data.file_url);
        if (data.file_size > _8_MIB && data.large_file_url === data.file_url) {
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
