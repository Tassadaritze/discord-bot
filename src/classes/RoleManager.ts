import { ColorResolvable, Guild, User } from "discord.js";
import fs from "fs";
import winston from "winston";

type RoleManagerStorageValue = {
    v: [string, string][];
    dataType: string;
};

const isRoleManagerStorageValue = (obj: unknown): obj is RoleManagerStorageValue =>
    typeof (obj as RoleManagerStorageValue).dataType === "string" &&
    Array.isArray((obj as RoleManagerStorageValue).v) &&
    (obj as RoleManagerStorageValue).v.every((el) => el.length === 2) &&
    (obj as RoleManagerStorageValue).v.every((el) => el.every((elem) => typeof elem === "string"));

const isRolesMap = (obj: unknown): obj is Map<string, Map<string, string>> =>
    obj instanceof Map &&
    [...obj.keys()].some((k) => typeof k === "string") &&
    [...obj.values()].some(
        (v) =>
            v instanceof Map &&
            [...v.keys()].some((key) => typeof key === "string") &&
            [...v.values()].some((value) => typeof value === "string")
    );

/*
 * Not a misleading name at all
 *
 * Keeps track of ids of users who have opted in to role colour randomising.
 *
 * Also stores the ids of the guilds they opted in on, and the corresponding role and its id
 */
class RoleManager {
    // { userId: { guildId0: roleId0, ..., guildIdN: roleIdN } }
    roles: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

    constructor() {
        this.#import();
    }

    // Imports previously created list from file
    #import = (): void => {
        try {
            const data = fs.readFileSync("./storage/role_colour_randomizer.json", "utf8");
            const roles = JSON.parse(data, (k, v: unknown) => {
                if (isRoleManagerStorageValue(v)) {
                    return new Map(v.v);
                }
                return v;
            }) as unknown;
            if (isRolesMap(roles)) {
                this.roles = roles;
            }
        } catch {
            winston.info("Couldn't read saved role colour randomizer data from disc");
        }
    };

    // Exports current state of the list to file
    #export = (): void => {
        fs.writeFileSync(
            "./storage/role_colour_randomizer.json",
            JSON.stringify(this.roles, (k, v: unknown) => {
                if (v instanceof Map) {
                    return {
                        dataType: "Map",
                        v: [...v]
                    };
                } else {
                    return v;
                }
            }),
            "utf8"
        );
    };

    // Returns a random RGB colour
    #randomRGB = (): ColorResolvable => {
        const randomColour = () => Math.floor(Math.random() * 256);
        return [randomColour(), randomColour(), randomColour()];
    };

    // Adds user to list and makes a new role for them
    addUser = (user: User, guild: Guild): void => {
        const member = guild.members.resolve(user);
        if (member) {
            guild.roles
                .create({
                    name: "random",
                    color: this.#randomRGB()
                })
                .then((role) => {
                    member.roles.add(role).catch(winston.error);
                    // If user is already stored, add to their entry; else make a new entry
                    if (this.roles.has(user.id)) {
                        this.roles.get(user.id)?.set(guild.id, role.id);
                    } else {
                        this.roles.set(user.id, new Map<string, string>().set(guild.id, role.id));
                    }
                    this.#export();
                })
                .catch(winston.error);
        }
    };

    // Deletes user from list and deletes their corresponding role from the guild
    deleteUser = (user: User, guild: Guild): void => {
        const userEntry = this.roles.get(user.id);
        const guildEntry = this.roles.get(user.id)?.get(guild.id);
        if (guildEntry) {
            guild.roles.delete(guildEntry).catch(winston.error);
        }
        this.roles.get(user.id)?.delete(guild.id);
        if (userEntry && userEntry.size < 1) {
            this.roles.delete(user.id);
        }
        this.#export();
    };

    // Randomises role colour for provided user
    randomise = (user: User, guild: Guild): void => {
        const guildEntry = this.roles.get(user.id)?.get(guild.id);
        if (guildEntry) {
            guild.roles.edit(guildEntry, { color: this.#randomRGB() }, "Blame Tessie").catch(winston.error);
        }
    };
}

export default RoleManager;
