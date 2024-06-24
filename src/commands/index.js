const handleLeaveCommand = require("./handleLeave");
const {
  playAudioFromYouTube,
  pauseAudio,
  unpauseAudio,
  volumeForAudio,
} = require("./handleYoutube.js");
const handleMuteCommand = require("./handleMute");
const handleSkipCommand = require("./handleSkip");
const handleSearchCommand = require("./handleSearch");

module.exports = {
  handleLeaveCommand,
  playAudioFromYouTube,
  pauseAudio,
  unpauseAudio,
  volumeForAudio,
  handleMuteCommand,
  handleSkipCommand,
  handleSearchCommand,
};
