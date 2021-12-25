import { Client, ClientOptions, Collection, TextChannel } from "discord.js";
import { Command } from "../events/interactionCreate";

class ClientPlus extends Client {
    commands: Collection<string, Command> = new Collection<string, Command>();
    markov: NodeJS.Timer | undefined;
    eventReportChannel: TextChannel | undefined;

    constructor(props: ClientOptions) {
        super(props);
    }
}

export default ClientPlus;