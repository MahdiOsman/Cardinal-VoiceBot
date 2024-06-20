const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = async (message) => {
  console.log("This is youtube audio player.");
  const prompt = message.content.split(" ").slice(2).join(" ");
  const searchResult = ytSearch(prompt);
  const video = searchResult.videos.length > 0 ? searchResult.videos[0] : null;

  if (!video) {
    message.reply("No video found for the query.");
    return;
  }

  const url = video.url;
  const stream = ytdl(url, { filter: "audioonly" });

  const connection = getVoiceConnection(message.guild.id);
  if (!connection) {
    return await message.reply("I am not connected to a voice channel.");
  }

  const player = connection.state.audioPlayer;

  const resource = createAudioResource(stream);
  connection.subscribe(player);
  player.play(resource);

  player.on(AudioPlayerStatus.Idle, () => {
    console.log("Audio finished playing");
    player.stop();
  });

  player.on("error", (error) => {
    console.error(`Error playing audio: ${error.message}`);
  });
};
