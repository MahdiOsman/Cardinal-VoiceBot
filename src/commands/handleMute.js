/**
 * Mute the audio stream.
 */
const { getVoiceConnection, AudioPlayerStatus } = require("@discordjs/voice");

module.exports = async (message) => {
  const connection = getVoiceConnection(message.guild.id);
  if (!connection) {
    return await message.reply("I am not connected to a voice channel.");
  }

  const player = connection.state.audioPlayer;
  if (
    player &&
    (player.state.status === AudioPlayerStatus.Playing ||
      player.state.status === AudioPlayerStatus.Paused)
  ) {
    player.stop();
    await message.reply("Stopped the audio.");
  } else {
    await message.reply("No audio is currently playing.");
  }
};
