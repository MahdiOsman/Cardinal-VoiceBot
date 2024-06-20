/**
 * Mute the audio stream.
 */
const {
  getVoiceConnection,
  AudioPlayerStatus,
  createAudioPlayer,
} = require("@discordjs/voice");

module.exports = async (message) => {
  try {
    // Validate if the user is in a voice channel
    const memberVoiceChannel = message.member.voice.channel;
    if (!memberVoiceChannel) {
      await message.reply(
        "You need to be in a voice channel to use this command."
      );
      return;
    }

    // Join the voice channel
    const connection =
      getVoiceConnection(memberVoiceChannel.guild.id) ||
      joinVoiceChannel({
        channelId: memberVoiceChannel.id,
        guildId: memberVoiceChannel.guild.id,
        adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator,
      });

    // Check if connection is not available
    if (!connection) {
      await message.reply("Failed to join the voice channel.");
      return;
    }

    // Get the audio player from the connection state
    const player = createAudioPlayer();
    connection.subscribe(player);
    // Stop audio
    player.stop();

    player.on("error", (error) => {
      console.error(`Error stopping audio: ${error.message}`);
    });
  } catch (error) {
    console.error(`Error stopping audio: ${error.message}`);
    await message.reply("There was an error trying to stop media.");
  }
};
