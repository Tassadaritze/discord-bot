import "../../env/env.js";
import fetch from "node-fetch";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import ClientPlus from "../classes/ClientPlus";
import { sanitize } from "./danbooru.js";

export default {
    data: new SlashCommandBuilder()
        .setName("196")
        .setDescription("Post a random post from r/196 (may be NSFW if used in an NSFW channel)"),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const client = interaction.client as ClientPlus;
        if (!client.redditAccessToken) {
            if (
                !process.env.REDDIT_USERNAME ||
                !process.env.REDDIT_PASSWORD ||
                !process.env.REDDIT_CLIENT_ID ||
                !process.env.REDDIT_CLIENT_SECRET
            ) {
                await interaction.editReply("_Not all fields required to use the Reddit API have been configured._");
                return;
            }

            const auth = { Authorization: "Basic " + Buffer.from(process.env.REDDIT_CLIENT_ID + ":" + process.env.REDDIT_CLIENT_SECRET).toString("base64") };
            const postData = { grant_type: "password", username: process.env.REDDIT_USERNAME, password: process.env.REDDIT_PASSWORD };
            const userAgent = { "User-Agent": `windows:discord-bot:v${process.env.npm_package_version} (by /u/Tassadaritze)` };

            const response = await fetch("https://www.reddit.com/api/v1/access_token", {
                method: "POST",
                headers: { ...auth, ...userAgent },
                body: new URLSearchParams(postData)
            });

            // TODO: use the headers Reddit API sends to rate limit on my side? useless for me, but will be a nice exercise?
            const data = await response.json();
            if (!isAccessTokenData(data)) {
                await interaction.editReply("_Couldn't get access token from Reddit API._");
                console.error("[ERROR] Couldn't get access token from Reddit API.");
                return;
            }

            client.redditAccessToken = data.access_token;
            setTimeout(() => client.redditAccessToken = null, data.expires_in * 1000);
        }

        // const response = await fetch("");

        // let data = await response.json();
        /*
        if (!isPostData(data)) {
            await interaction.editReply("");
            return;
        }

         */

        /*
        const image = data.file_size > 8 * 1024 * 1024 ? sanitize(data.large_file_url) : sanitize(data.file_url);    // 8 MiB
        await interaction.editReply({
            content: image ? undefined : "_Couldn't download image from unsafe URL._",
            files: image ? [image] : undefined
        });

         */
        const test = sanitize("https://example.com/");
        await interaction.editReply("_Success!_");
    }
};

type AccessTokenData = {
    access_token: string,
    expires_in: number
}

const isAccessTokenData = (object: any): object is AccessTokenData => {
    return !!(object.access_token && object.expires_in);
};