/**
 * Unpause the current audio stream
 */
const { getVoiceConnection, AudioPlayerStatus } = require("@discordjs/voice");

module.exports = async (message) => {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) {
        return await message.reply("I am not connected to a voice channel.");
    }
    
    const player = connection.state.audioPlayer;
    if (player.state.status !== AudioPlayerStatus.Paused) {
        return await message.reply("The audio stream is not paused.");
    }
    
    player.unpause();
    await message.reply("Unpaused the audio stream.");
};
