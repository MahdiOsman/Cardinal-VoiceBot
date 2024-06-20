const handleJoin = require("../commands/handleJoin");
const handleLeave = require("../commands/handleLeave");
const handlePlay = require("../commands/handlePlay");
const handlePause = require("../commands/handlePause");
const handleSkip = require("../commands/handleSkip");
const handleMute = require("../commands/handleMute");

module.exports = async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    if (content === "?ping") {
        await message.reply("Pong!");
    } else if (content === "?join") {
        await handleJoin(message);
    } else if (content === "?leave") {
        await handleLeave(message);
    } else if (content.startsWith("?play")) {
        await handlePlay(message);
    } else if (content === "?pause") {
        await handlePause(message);
    } else if (content === "?skip") {
        await handleSkip(message);
    } else if (content === "?mute") {
        await handleMute(message);
    }
};
