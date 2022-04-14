import { Client, ClientOptions, Collection, TextChannel } from "discord.js";
import { Command } from "../events/interactionCreate";
import MarkovManager from "./MarkovManager.js";

class ClientPlus extends Client {
    commands: Collection<string, Command> = new Collection<string, Command>();
    markov: MarkovManager = new MarkovManager();
    eventReportChannel: TextChannel | undefined;

    constructor(props: ClientOptions) {
        super(props);
    }
}

export default ClientPlus;