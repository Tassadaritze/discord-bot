import { Client, ClientOptions, Collection, TextChannel } from "discord.js";
import { Command } from "../types.js";
import MarkovManager from "./MarkovManager.js";
import RoleManager from "./RoleManager.js";
import TicTacToe from "./TicTacToe.js";

class ClientPlus extends Client {
    commands: Collection<string, Command> = new Collection<string, Command>();
    markov: MarkovManager = new MarkovManager();
    roles: RoleManager = new RoleManager();
    tictactoe = new Collection<string, Collection<string, TicTacToe>>(); // { channelId: { userId0: TicTacToe0, ..., userIdN: TicTacToeN } }
    eventReportChannel: TextChannel | undefined;

    constructor(props: ClientOptions) {
        super(props);
    }
}

export default ClientPlus;
