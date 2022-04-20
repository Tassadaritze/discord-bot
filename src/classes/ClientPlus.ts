import { Client, ClientOptions, Collection, TextChannel } from "discord.js";
import { Command } from "../events/interactionCreate";
import MarkovManager from "./MarkovManager.js";
import RoleManager from "./RoleManager.js";

class ClientPlus extends Client {
    commands: Collection<string, Command> = new Collection<string, Command>();
    markov: MarkovManager = new MarkovManager();
    roles: RoleManager = new RoleManager();
    eventReportChannel: TextChannel | undefined;

    constructor(props: ClientOptions) {
        super(props);
    }
}

export default ClientPlus;