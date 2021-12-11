import "../env/env.js";
import fs from "fs";
import Markov from "markov-strings";
import { Channel, Client } from "discord.js";


const startMarkovInterval = (markov: Markov, client: Client, channel: Channel) => {
    const markovTimer = setInterval(() => {
        const generated = markov.generate({
            maxTries: 1000,
            filter: result => result.score > 10
        });
        console.log(generated);
        if (channel.isText() &&
            (!channel.lastMessage ||
                channel.lastMessage.author.id !== client.user?.id)) channel.send(generated.string);
    }, 300000)

    return markovTimer;
}

const startMarkovSpam = async (client: Client) => {
    const targetChannel = await client.channels.fetch("464502359372857355");
    console.log(targetChannel);
    const messages = fs.readFileSync("./message-dump.txt", "utf8");
    let messageArray = messages.split("\n");
    messageArray.pop();
    console.log(messageArray);
    const markov = new Markov({ stateSize: 3 });
    console.log("Started adding data");
    if (fs.existsSync("./markov-corpus.json")) {
        console.log("Found existing corpus, importing it instead");
        const corpus = fs.readFileSync("./markov-corpus.json", "utf8");
        markov.import(JSON.parse(corpus));
    } else {
        markov.addData(messageArray);
        fs.writeFileSync("./markov-corpus.json", JSON.stringify(markov.export()));
        console.log("Exported corpus");
    }
    console.log("Finished adding data");

    if (targetChannel) return startMarkovInterval(markov, client, targetChannel);

    return;
}


export default startMarkovSpam;