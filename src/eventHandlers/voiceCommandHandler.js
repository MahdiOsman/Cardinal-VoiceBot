const {
  handleLeaveCommand,
  handleSkipCommand,
  playAudioFromYouTube,
  pauseAudio,
  unpauseAudio,
  volumeForAudio,
  handleMuteCommand,
  handleSearchCommand,
} = require("../commands");

module.exports = (command, message, prompt) => {
  const commandHandlers = {
    // Handle Leave Commands
    leave: handleLeaveCommand,
    disconnect: handleLeaveCommand,
    disappear: handleLeaveCommand,
    vanish: handleLeaveCommand,
    die: handleLeaveCommand,

    // Handle Music Commands
    skip: handleSkipCommand,
    next: handleSkipCommand,
    pause: pauseAudio,
    unpause: unpauseAudio,
    resume: unpauseAudio,
    play: playAudioFromYouTube,
    mute: handleMuteCommand,
    stop: handleMuteCommand,
    volume: volumeForAudio,

    // Handle OpenAI Commands
    search: handleSearchCommand,
    browse: handleSearchCommand,
    check: handleSearchCommand,
    scan: handleSearchCommand,
  };
  console.log(prompt);
  // If the command is recognized, call the appropriate handler
  const handler = commandHandlers[command];
  if (handler) {
    handler(message, prompt);
  } /* else {
    console.error(`Command ${command} unknown.`);
  } */
};

/* message.content.split(" ").slice(2).join(" "); */
