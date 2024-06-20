const handleJoin = require("../commands/handleJoin");
const handleLeave = require("../commands/handleLeave");
const handlePlay = require("../commands/handleYoutubeAudio");
const handlePause = require("../commands/handlePause");
const handleSkip = require("../commands/handleSkip");
const handleMute = require("../commands/handleMute");
const handleSearch = require("../commands/handleMute");

const prefix = "!";

module.exports = async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === prefix + "ping") {
    await message.reply("Pong!");
  } else if (content === prefix + "join") {
    await handleJoin(message);
  } else if (content === prefix + "leave") {
    await handleLeave(message);
  } else if (content.startsWith(prefix + "play")) {
    await handlePlay(message);
  } else if (content === prefix + "pause") {
    await handlePause(message);
  } else if (content === prefix + "skip") {
    await handleSkip(message);
  } else if (content === prefix + "mute") {
    await handleMute(message);
  } else if (content === prefix + "search") {
    await handleSearch(message);
  }
};
