/**
 * Play an audio file in the voice channel the user is in.
 */
const {
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

async function playAudioFromYouTube(message, prompt) {
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

    let startTime = 0; // Start time for the stream in seconds

    // Function to play audio stream from YouTube URL
    const playStream = (url, startTime) => {
      const stream = ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
        begin: `${startTime}s`,
      });
      const resource = createAudioResource(stream, { inlineVolume: true });
      const player = createAudioPlayer();
      player.play(resource);

      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        console.log("Audio finished playing");
        player.stop();
      });

      player.on("error", (error) => {
        console.error(`Error playing audio: ${error.message}`);
        stream.destroy();
        startTime += Math.floor(player.playbackDuration / 1000); // Update startTime to the current playback position
        message.reply("There was an error trying to play music. Retrying...");
        playStream(url, startTime); // Retry playing the stream from the last known position
      });

      setInterval(() => {
        startTime += Math.floor(player.playbackDuration / 1000);
      }, 1000);
    };

    await message.reply(`**### Now Playing:**` + url);
    // Start playing the stream
    playStream(url, startTime);
  } catch (error) {
    console.error(`Error playing audio: ${error.message}`);
    await message.reply("There was an error trying to play music.");
  }
}

// Pause audio
async function pauseAudio(message) {
  try {
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
  } catch (error) {
    console.error(`Error getting player resource: ${error.message}`);
    return;
  }
}

// Unpause the audio
async function unpauseAudio(message) {
  try {
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
  } catch (error) {
    console.error(`Error getting player resource: ${error.message}`);
    return;
  }
}

async function volumeForAudio(message, prompt) {
  const connection = getVoiceConnection(message.guild.id);

  if (!connection) {
    return message.reply("There is no active voice connection in this guild.");
  }

  const volume = parseFloat(prompt / 100);
  if (isNaN(volume) || volume < 0 || volume > 1) {
    return message.reply("Please provide a volume level between 0 and 100.");
  }

  try {
    const player = connection.state.subscription.player;
    const resource = player.state.resource;
    if (!resource || !resource.volume) {
      return message.reply("There is no audio currently playing.");
    }
    resource.volume.setVolume(volume);
    return message.reply(`Volume set to ${volume * 100}%`);
  } catch (error) {
    console.error(`Error getting player resource: ${error.message}`);
    return;
  }
}

module.exports = {
  playAudioFromYouTube,
  pauseAudio,
  unpauseAudio,
  volumeForAudio,
};
