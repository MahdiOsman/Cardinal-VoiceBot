const {
  handleLeaveCommand,
  handleSkipCommand,
  handlePauseCommand,
  handleUnpauseCommand,
  playAudioFromYouTube,
  pauseAudio,
  unpauseAudio,
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

    // Handle OpenAI Commands
    search: handleSearchCommand,
  };
  console.log(prompt);
  // If the command is recognized, call the appropriate handler
  const handler = commandHandlers[command];
  if (handler) {
    handler(message, prompt);
  } else {
    console.error(`Command ${command} unknown.`);
  }
};

/* message.content.split(" ").slice(2).join(" "); */
