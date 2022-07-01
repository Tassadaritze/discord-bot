import Markov from "markov-strings";
import type { MarkovImportExport } from "markov-strings";
import type { TextChannel } from "discord.js";
import fs from "fs";
import winston from "winston";

class MarkovManager {
    readonly #markovData: Markov;
    #markov: Record<string, NodeJS.Timer> | undefined;
    #messageInterval = 5 * 60 * 1000;
    #exportInterval = 10 * 60 * 1000;
    #previousExport: string | undefined;

    constructor() {
        this.#markovData = new Markov({ stateSize: 3 });
        this.#addData();

        setInterval(() => {
            const data = JSON.stringify(this.#markovData.export());

            if (data === this.#previousExport) {
                return;
            }

            this.#previousExport = data;
            this.#exportData();
        }, this.#exportInterval);
    }

    // Imports data from plain text and exports it to file, or imports it from a previously exported file
    #addData = (): void => {
        let messageArray;
        try {
            const messages = fs.readFileSync("./message-dump.txt", "utf8");
            messageArray = messages.split("\n");
            messageArray.pop();
        } catch {
            winston.info("Couldn't read message dump or it doesn't exist");
        }
        // console.log(messageArray);
        winston.info("Started adding data");
        try {
            winston.info("Trying to read potential existing corpus");
            const corpus = fs.readFileSync("./markov-corpus.json", "utf8");
            const parsed = JSON.parse(corpus) as unknown;
            if (!!parsed && typeof parsed === "object") {
                // idk how the fuck to typecheck this
                this.#markovData.import(parsed as MarkovImportExport);
            }
        } catch {
            if (messageArray) {
                winston.info("Couldn't read corpus, creating a new one");
                this.#markovData.addData(messageArray);
                this.#exportData();
            } else {
                winston.info(
                    "No corpus or message dump could be found, markov-generated strings might be low-quality for a while"
                );
            }
        }
        winston.info("Finished adding data");
        return;
    };

    // Exports markov data to file
    #exportData = (): void => {
        fs.writeFileSync("./markov-corpus.json", JSON.stringify(this.#markovData.export()));
        winston.info("Exported corpus");
        return;
    };

    // Sets markov interval in channel, and returns its id
    #startMarkovInterval = (channel: TextChannel): NodeJS.Timer => {
        return setInterval(() => void channel.send(this.generate()).catch(winston.error), this.#messageInterval);
    };

    // Generate a markov result
    generate = (): string => {
        const generated = this.#markovData.generate({
            maxTries: 1000,
            filter: (result) => {
                return result.score > 10 && result.refs.length > 1;
            }
        });
        winston.info(generated);
        if (generated.string.toLowerCase().includes("index")) {
            winston.silly("Incorrect opinion detected, activating override");
            return `I was going to say something like \`${generated.string}\`, but then I remembered that's incorrect.`;
        } else {
            return generated.string;
        }
    };

    // Adds a single string to markov data
    addString = (string: string): void => {
        this.#markovData.addData([string]);
        return;
    };

    // Gets object containing channel ids and corresponding markov intervals
    getMarkov = (): Record<string, NodeJS.Timer> | undefined => {
        return this.#markov;
    };

    // Starts a new markov interval in provided channel, and adds entry to markov object
    startMarkovSpam = (channel: TextChannel): void => {
        this.#markov = { ...this.#markov, [channel.id]: this.#startMarkovInterval(channel) };
        return;
    };

    // Stops the markov interval in provided channel, and removes entry from markov object
    stopMarkovSpam = (id: string): void => {
        if (this.#markov && Object.keys(this.#markov).includes(id)) {
            clearInterval(this.#markov[id]);
            delete this.#markov[id];
        } else {
            winston.error(`Couldn't clear markov interval in channel with id ${id}`);
        }
        return;
    };
}

export default MarkovManager;
