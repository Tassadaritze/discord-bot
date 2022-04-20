import { Client, ColorResolvable, Guild, User } from "discord.js";
import fs from "fs";

class RoleManager {
    // Stores user ids and their corresponding role ids
    private _roles: Record<string, Record<string, string>> | undefined;

    constructor() {
        this.import();
    }

    // Imports previously created list from file
    private import = (): void => {
        if (fs.existsSync("./persistent.json")) {
            this._roles = JSON.parse(fs.readFileSync("./persistent.json", "utf8"));
        }
    }

    // Exports current state of the list to file
    private export = (): void => {
        fs.writeFileSync("./persistent.json", JSON.stringify(this.roles), "utf8");
    }

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
                    this._roles = { ...this._roles, [guild.id]: { [user.id]: role.id } };
                    this.export();
                })
                .catch(err => console.error(err, "Error making new role for role colour randomiser"));
        }
    };

    // Deletes user from list and deletes their corresponding role from the guild
    deleteUser = (user: User, client: Client): void => {
        const roles = this.roles;
        if (roles && Object.keys(roles).includes(user.id)) {
            client.guilds.fetch(roles[user.id].guild)
                .then(guild => guild.roles.delete(roles[user.id].role)
                        .then(() => {
                            delete roles[user.id];
                            this.export();
                        }));
        } else {
            console.error(user, "Error removing user from role colour randomiser");
        }
    }

    // Randomises role colour for provided user
    randomise = (user: User, guild: Guild): void => {
        const roles = this.roles;
        if (roles)
            guild.roles.edit(roles[user.id].role, { color: this.randomRGB() })
                .catch(err => console.error(err, `Error randomising role colour for role with id ${roles[user.id].role} on user ${user.username}`));
    }

    // Get a list of user ids and their corresponding role ids
    get roles(): Record<string, Role> | undefined {
        return this._roles;
    }
}

export default RoleManager;