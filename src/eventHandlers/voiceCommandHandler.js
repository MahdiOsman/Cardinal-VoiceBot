const { handleLeaveCommand, handlePlayCommand, handlePauseCommand, handleUnpauseCommand, handleMuteCommand } = require("../commands");

module.exports = (command, message) => {
    // Clean up the message (remove caps/extra spaces/special characters)
    command = command.toLowerCase().replace(/[^a-z0-9 ]/g, "");

    // If the command is recognized, call the appropriate handler
    switch (command) {
        case "join":
            console.log("Join command recognized");
            handleJoinCommand(message);
            break;
        case "leave":
            console.log("Leave command recognized");
            handleLeaveCommand(message);
            break;
        case "play":
            console.log("Play command recognized");
            handlePlayCommand(message);
            break;
        case "pause":
            console.log("Pause command recognized");
            handlePauseCommand(message);
            break;
        case "skip":
            console.log("Skip command recognized");
            handleSkipCommand(message);
            break;
        case "mute":
            console.log("Mute command recognized");
            handleMuteCommand(message);
            break;
        default:
            message.reply(`Unrecognized command: ${command}`);
    }
};
