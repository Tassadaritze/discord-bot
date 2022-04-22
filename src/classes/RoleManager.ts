import { ColorResolvable, Guild, User } from "discord.js";
import fs from "fs";

// Keeps track of ids of users who have opted in to role colour randomising.
// Also stores the ids of the guilds they opted in on, and the corresponding role and its id
class RoleManager {
    // { userId: { guildId0: roleId0, ..., guildIdN: roleIdN } }
    private _roles: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

    constructor() {
        this.import();
    }

    // Imports previously created list from file
    private import = (): void => {
        if (fs.existsSync("./persistent.json")) {
            this._roles = JSON.parse(fs.readFileSync("./persistent.json", "utf8"), (k, v) => {
                if (typeof v === "object" && v !== null)
                    if (v.dataType === "Map")
                        return new Map(v.v);
                return v;
            });
        }
    };

    // Exports current state of the list to file
    private export = (): void => {
        fs.writeFileSync("./persistent.json", JSON.stringify(this.roles, (k, v) => {
            if (v instanceof Map) {
                return {
                    dataType: "Map",
                    v: [...v]
                };
            } else {
                return v;
            }
        }), "utf8");
    };

    // Returns a random RGB colour
    private randomRGB = (): ColorResolvable => {
        const randomColour = () => Math.floor(Math.random() * 256);
        return [randomColour(), randomColour(), randomColour()];
    };

    // Adds user to list and makes a new role for them
    addUser = (user: User, guild: Guild): void => {
        const member = guild.members.resolve(user);
        if (member) {
            guild.roles.create({
                name: "random",
                color: this.randomRGB()
            })
                .then(role => {
                    member.roles.add(role)
                        .catch(err => console.error(err, `Error adding role colour randomiser role to member ${member.displayName}`));
                    // If user is already stored, add to their entry; else make a new entry
                    if (this.roles.has(user.id))
                        this.roles.get(user.id)?.set(guild.id, role.id);
                    else
                        this.roles.set(user.id, new Map<string, string>().set(guild.id, role.id));
                    this.export();
                })
                .catch(err => console.error(err, "Error making new role for role colour randomiser"));
        }
    };

    // Deletes user from list and deletes their corresponding role from the guild
    deleteUser = (user: User, guild: Guild): void => {
        const userEntry = this.roles.get(user.id);
        const guildEntry = this.roles.get(user.id)?.get(guild.id);
        if (guildEntry)
            guild.roles.delete(guildEntry)
                .catch(err => console.error(err, `Error deleting role with id ${guildEntry} for user ${user.username}`));
        this.roles.get(user.id)?.delete(guild.id);
        if (userEntry && userEntry.size < 1)
            this.roles.delete(user.id);
        this.export();
    };

    // Randomises role colour for provided user
    randomise = (user: User, guild: Guild): void => {
        const guildEntry = this.roles.get(user.id)?.get(guild.id);
        if (guildEntry)
            guild.roles.edit(guildEntry, { color: this.randomRGB() }, "Blame Tessie")
                .catch(err => console.error(err, `Error randomising role colour for role with id ${guildEntry} on user ${user.username}`));
    };

    // Get a list of user ids and their corresponding role ids
    get roles(): Map<string, Map<string, string>> {
        return this._roles;
    }
}

export default RoleManager;