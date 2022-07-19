import fetch from "node-fetch";
import type { CommandInteraction, TextChannel } from "discord.js";
import { AttachmentBuilder } from "discord.js";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import winston from "winston";
import * as fs from "fs";

import { isGeneralStorage } from "../types";

type PostData = {
    file_size: number;
    file_url: string;
    large_file_url: string;
};

const isPostData = (obj: unknown): obj is PostData =>
    typeof (obj as PostData).file_size === "number" &&
    typeof (obj as PostData).file_url === "string" &&
    typeof (obj as PostData).large_file_url === "string";

const enum NSFW {
    NSFW,
    Sensitive,
    Off
}

const _8_MIB = 8 * 1024 * 1024;

export default {
    data: new SlashCommandBuilder()
        .setName("danbooru")
        .setDescription("Post a random image with given tag from Danbooru (may be NSFW if used in an NSFW channel)")
        .addStringOption(
            new SlashCommandStringOption().setName("tag").setDescription("Tag to search (omit for a random image)")
        ),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        if (!process.env.DANBOORU_USERNAME || !process.env.DANBOORU_API_KEY) {
            await interaction.editReply(
                "_The environment variables DANBOORU_USERNAME and DANBOORU_API_KEY " +
                    "must be set to enable usage of this command._"
            );
            return;
        }

        let nsfw: NSFW = NSFW.Off;
        if ((interaction.channel as TextChannel).nsfw) {
            nsfw = NSFW.NSFW;
        } else {
            try {
                const general = JSON.parse(fs.readFileSync("./storage/general.json", "utf-8")) as unknown;
                if (isGeneralStorage(general) && general.whitelist.includes(interaction.channelId)) {
                    nsfw = NSFW.Sensitive;
                }
            } catch (e) {
                winston.error("Error trying to read ./storage/general.json").error(e);
            }
        }

        const params = new URLSearchParams({
            login: process.env.DANBOORU_USERNAME,
            api_key: process.env.DANBOORU_API_KEY
        });

        let tag = interaction.options.get("tag")?.value;
        let replyTag = "random";
        if (typeof tag === "string") {
            tag = tag.trim().replaceAll(" ", "_");
            replyTag = tag.replaceAll("_", "\\_");
        }

        switch (nsfw) {
            case NSFW.NSFW: {
                if (typeof tag === "string") {
                    params.set("tags", tag);
                }
                break;
            }
            case NSFW.Sensitive: {
                typeof tag === "string"
                    ? params.set("tags", `(rating:general ${tag}) or (rating:sensitive ${tag})`)
                    : params.set("tags", "rating:general or rating:sensitive");
                break;
            }
            case NSFW.Off:
            default: {
                typeof tag === "string"
                    ? params.set("tags", `rating:general ${tag}`)
                    : params.set("tags", "rating:general");
            }
        }

        let response;
        try {
            response = await fetch(`https://danbooru.donmai.us/posts/random.json?${params.toString()}`);
        } catch (e) {
            winston.error(e);
            interaction.editReply(`**${replyTag}:** _Couldn't connect to Danbooru._`).catch(winston.error);
            return;
        }

        const data = await response.json();
        winston.info(data);
        if (!isPostData(data)) {
            interaction
                .editReply(
                    `**${replyTag}:** _Danbooru has returned an error.${
                        nsfw !== NSFW.NSFW ? " (Trying this again in an NSFW channel might help.)" : ""
                    }_`
                )
                .catch(winston.error);
            return;
        }

        const image = data.file_size > _8_MIB ? sanitize(data.large_file_url) : sanitize(data.file_url);
        if (data.file_size > _8_MIB && data.large_file_url === data.file_url) {
            interaction.editReply(`**${replyTag}:** _Image too large, posting link instead:_`).catch(winston.error);
            if (interaction.channel) {
                await interaction.channel.send(data.file_url);
            }
            return;
        }

        if (image) {
            try {
                const response = await fetch(image);

                if (!response.body) {
                    const e = "Fetched image stream is null";
                    winston.error(e);
                    interaction.editReply(`**${replyTag}:** _${e}._`).catch(winston.error);
                    return;
                }

                const attachment = new AttachmentBuilder(response.body);
                interaction
                    .editReply({
                        content: `**${replyTag}:**`,
                        files: [attachment]
                    })
                    .catch(winston.error);
            } catch (e) {
                winston.error(e);
                interaction.editReply(`**${replyTag}:** _Couldn't connect to Danbooru._`).catch(winston.error);
            }
        } else {
            interaction.editReply(`**${replyTag}:** _Couldn't download image from unsafe URL._`).catch(winston.error);
        }
    }
};

const sanitize = (url: string): string | null => {
    const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;

    if (url.match(SAFE_URL_PATTERN)) {
        return url;
    } else {
        return null;
    }
};
