import { ColorResolvable, Message } from "discord.js";
import ClientPlus from "../classes/ClientPlus";


const randomRGB = (): ColorResolvable => {
    const randomColour = () => Math.floor(Math.random() * 256);
    return [randomColour(), randomColour(), randomColour()];
}


export default {
    name: "messageCreate",
    async execute(message: Message) {
        const client = message.client as ClientPlus;
        if (message.author.id !== client.user?.id)
            client.markov.addString(message.content);
        if (message.author.id === "392352456303968256") {
            const guild = await message.client.guilds.fetch("464502358924197912");
            await guild.roles.edit("816031494673661953", { color: randomRGB() }, "Blame Tessie");
        }
    }
}
