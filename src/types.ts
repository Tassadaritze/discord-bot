import type { Client, CommandInteraction } from "discord.js";
import { Collection } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export type Command = {
    data: SlashCommandBuilder;
    execute: (arg0: CommandInteraction) => Promise<void>;
};

export const isCommand = (obj: unknown): obj is Command =>
    (obj as Command).data instanceof SlashCommandBuilder && (obj as Command).execute instanceof Function;

interface ClientWithCommands extends Client {
    commands: Collection<string, Command>;
}

export const isClientWithCommands = (obj: unknown): obj is ClientWithCommands =>
    (obj as ClientWithCommands).commands instanceof Collection;

type Event = {
    name: string;
    once: boolean | undefined;
    execute: (...args: unknown[]) => void;
};

export const isEvent = (obj: unknown): obj is Event =>
    typeof (obj as Event).name === "string" &&
    (typeof (obj as Event).once === "boolean" || !(obj as Event).once) &&
    (obj as Event).execute instanceof Function;

type GeneralStorage = {
    whitelist: string[];
};

export const isGeneralStorage = (obj: unknown): obj is GeneralStorage =>
    Array.isArray((obj as GeneralStorage).whitelist);
