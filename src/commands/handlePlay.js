/**
 * Play an audio file in the voice channel the user is in.
 */
const {
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const fs = require("fs");
const path = require("path");

module.exports = async (message) => {
  const args = message.content.split(" ");
  const audioFile = args.slice(1).join(" ");
  if (!audioFile) {
    return message.reply("Please specify an audio file to play.");
  }

  const filePath = path.join(__dirname, "../../recordings", `${audioFile}.wav`);
  if (!fs.existsSync(filePath)) {
    return message.reply(`The file ${audioFile} does not exist.`);
  }

  const { channel } = message.member.voice;
  if (!channel) {
    return message.reply("You need to be in a voice channel to play audio.");
  }

  try {
    const connection =
      getVoiceConnection(channel.guild.id) ||
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      player.stop();
    });

    player.on("error", (error) => {
      console.error(`Error playing audio: ${error.message}`);
    });

    await message.reply(`Playing ${audioFile}`);
  } catch (error) {
    console.error(`Error playing audio: ${error.message}`);
    await message.reply(`There was an error trying to play ${audioFile}.`);
  }
};
