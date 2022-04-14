import Markov from "markov-strings";
import { AnyChannel, Client } from "discord.js";
import fs from "fs";


class MarkovManager {
    private readonly markovData: Markov;
    private markov: Record<string, NodeJS.Timer> | undefined;
    private messageInterval = 10000; // 5 * 60 * 1000;

    constructor() {
        this.markovData = new Markov({ stateSize: 3 });
        this.addData();
    }

    private addData = (): void => {
        const messages = fs.readFileSync("./message-dump.txt", "utf8");
        let messageArray = messages.split("\n");
        messageArray.pop();
        console.log(messageArray);
        console.log("Started adding data");
        if (fs.existsSync("./markov-corpus.json")) {
            console.log("Found existing corpus, importing it instead");
            const corpus = fs.readFileSync("./markov-corpus.json", "utf8");
            this.markovData.import(JSON.parse(corpus));
        } else {
            this.markovData.addData(messageArray);
            fs.writeFileSync("./markov-corpus.json", JSON.stringify(this.markovData.export()));
            console.log("Exported corpus");
        }
        console.log("Finished adding data");
        return;
    };

    private startMarkovInterval = (markov: Markov, client: Client, channel: AnyChannel): NodeJS.Timer => {
        return setInterval(() => {
            if (
                channel.isText() &&
                (channel.lastMessage && client.user &&
                    channel.lastMessage.author.id !== client.user.id)
            ) {
                const generated = markov.generate({
                    maxTries: 1000,
                    filter: result => {
                        return (
                            result.score > 10 &&
                            result.refs.length > 1
                        );
                    }
                });
                console.log(generated);
                if (generated.string.includes("Index")) {
                    console.log("Incorrect opinion detected, activating override");
                    channel.send(`I was going to say something like \`${generated.string}\`, but then I remembered that's incorrect.`);
                } else {
                    channel.send(generated.string);
                }
            }
        }, this.messageInterval);
    }

    getMarkov = (): Record<string, NodeJS.Timer> | undefined => {
        return this.markov;
    }

    startMarkovSpam = (client: Client, channel: AnyChannel): void => {
        this.markov = { ...this.markov, [channel.id]: this.startMarkovInterval(this.markovData, client, channel) };
        return;
    }

    // Stops messaging in provided channel, and removes entry from markov object
    stopMarkovSpam = (id: string): void => {
        const markov = this.getMarkov();
        if (markov && Object.keys(markov).includes(id)) {
            clearInterval(markov[id]);
            delete markov[id];
        } else {
            console.error(`Couldn't clear markov interval in channel with id ${id}`);
        }
        return;
    }
}

export default MarkovManager;