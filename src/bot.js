const { Client, GatewayIntentBits } = require("discord.js");
const { token } = require("../config/config.json");
const handleMessageCreate = require("./eventHandlers/messageCreateHandler");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once("ready", () => {
    console.log("Bot is online!");
});

client.on("messageCreate", handleMessageCreate);

client.login(token);
