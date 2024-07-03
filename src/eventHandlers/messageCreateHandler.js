const handleVoice = require("../commands/handleVoice");
const handleLeave = require("../commands/handleLeave");
const handleSkip = require("../commands/handleSkip");
const handleMute = require("../commands/handleMute");
const handleSearch = require("../commands/handleMute");

const prefix = "!";

module.exports = async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === prefix + "join") {
    await handleVoice(message);
  }
};
