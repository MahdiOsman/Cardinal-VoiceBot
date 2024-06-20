const {
  handleJoinCommand,
  handleSkipCommand,
  handleLeaveCommand,
  handleYoutubeAudioCommand,
  handlePauseCommand,
  handleUnpauseCommand,
  handleMuteCommand,
  handleSearchCommand,
} = require("../commands");

module.exports = (command, message, prompt) => {
  const commandHandlers = {
    // Handle Join Commands
    join: handleJoinCommand,
    // Handle Leave Commands
    leave: handleLeaveCommand,
    disconnect: handleLeaveCommand,
    disappear: handleLeaveCommand,
    vanish: handleLeaveCommand,
    die: handleLeaveCommand,

    // Handle Music Commands
    skip: handleSkipCommand,
    next: handleSkipCommand,
    pause: handlePauseCommand,
    unpause: handleUnpauseCommand,
    play: handleYoutubeAudioCommand,
    played: handleYoutubeAudioCommand,
    mute: handleMuteCommand,
    stop: handleMuteCommand,

    // Handle OpenAI Commands
    search: handleSearchCommand,
  };

  // Clean up the message (remove caps/extra spaces/special characters)

  command = command.toLowerCase().replace(/[^a-z0-9 ]/g, "");
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
