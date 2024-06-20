/**
 * Play an audio file in the voice channel the user is in.
 */
const { getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

async function playAudioFromYouTube(message, prompt) {
  console.log(prompt);
  try {
    // Search for videos based on the prompt
    const searchResult = await ytSearch(prompt);

    // Check if any videos were found
    if (!searchResult || searchResult.videos.length === 0) {
      await message.reply("No video found for the query.");
      return;
    }

    // Get the first video from the search results
    const video = searchResult.videos[0];
    const url = video.url;
    console.log(`Playing video: ${video.title} (${url})`);

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

    // Create an audio stream from YouTube URL
    const stream = ytdl(url, { filter: "audioonly" });

    // Get the audio player from the connection state
    const player = createAudioPlayer();
    // Create an audio resource
    const resource = createAudioResource(stream);

    // Subscribe to the connection and play the audio resource
    player.play(resource);
    connection.subscribe(player);

    // Event listeners for player events
    player.on(AudioPlayerStatus.Idle, () => {
      console.log("Audio finished playing");
      player.stop();
    });

    player.on("error", (error) => {
      console.error(`Error playing audio: ${error.message}`);
    });
  } catch (error) {
    console.error(`Error playing audio: ${error.message}`);
    await message.reply("There was an error trying to play music.");
  }
}

// Pause audio
async function pauseAudio(message) {
  const connection = getVoiceConnection(message.guild.id);
  if (!connection) {
    return message.reply("There is no audio currently playing.");
  }

  const player = connection.state.subscription.player;
  if (player.state.status === AudioPlayerStatus.Playing) {
    player.pause();
    return message.reply("Audio paused.");
  }

  return message.reply("Audio is already paused.");
}


// Unpause the audio 
async function unpauseAudio(message) {
  const connection = getVoiceConnection(message.guild.id);
  if (!connection) {
    return message.reply("There is no audio currently playing.");
  }

  const player = connection.state.subscription.player;
  if (player.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    return message.reply("Audio unpaused.");
  }

  return message.reply("Audio is not paused.");
}

module.exports = {
  playAudioFromYouTube,
  pauseAudio,
  unpauseAudio,
};