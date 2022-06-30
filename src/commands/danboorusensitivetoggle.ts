import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";
import * as fs from "fs";
import winston from "winston";

import { isGeneralStorage } from "../types.js";

export default {
    data: new SlashCommandBuilder()
        .setName("danboorusensitivetoggle")
        .setDescription(
            "Allows/disallows /danbooru to return posts with rating:sensitive when used in a non-NSFW channel"
        ),
    async execute(interaction: CommandInteraction) {
        if ((interaction.channel as TextChannel).nsfw) {
            await interaction.reply("_Using this command only makes sense in a non-NSFW channel, dummy._");
            return;
        }

        let whitelist: Set<string> = new Set();
        try {
            const general = JSON.parse(fs.readFileSync("./storage/general.json", "utf-8")) as unknown;
            if (isGeneralStorage(general)) {
                whitelist = new Set(general.whitelist);
            }
        } catch (e) {
            winston.error("Error trying to read ./storage/general.json").error(e);
        }

        if (whitelist.has(interaction.channelId)) {
            whitelist.delete(interaction.channelId);
            await interaction.reply("_Disabled Danbooru posts with rating:sensitive for this channel._");
        } else {
            whitelist.add(interaction.channelId);
            await interaction.reply("_Enabled Danbooru posts with rating:sensitive for this channel._");
        }

        try {
            fs.writeFileSync("./storage/general.json", JSON.stringify({ whitelist: [...whitelist] }), "utf-8");
        } catch (e) {
            winston.error("Error trying to write ./storage/general.json").error(e);
        }
    }
};
