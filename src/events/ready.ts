import ClientPlus from "../classes/ClientPlus";
import startMarkovSpam from "../markov.js";

export default {
    name: "ready",
    once: true,
    execute(client: ClientPlus) {
        if (client.user) {
            console.log(`Ready! Logged in as ${client.user.tag}`);
            startMarkovSpam(client)
                .then(markovTimer => client.markov = markovTimer);
        } else {
            throw TypeError;
        }
    }
}