/**
 * Unpause the current audio stream
 */
const { getVoiceConnection, AudioPlayerStatus } = require("@discordjs/voice");

module.exports = async (message) => {
  const connection = getVoiceConnection(message.guild.id);
  if (!connection) {
    return message.reply("I am not in a voice channel.");
  }

  const player = connection.state.audioPlayer;
  if (player && player.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    await message.reply("Unpaused the audio.");
  } else {
    await message.reply("No audio is currently playing.");
  }
};
