/**
 * Join a voice channel and start recording audio.
 */
const { joinVoiceChannel } = require("@discordjs/voice");
const { startRecording, stopRecording } = require("../utils/audioUtils");
const recognizeSpeech = require("../utils/speechUtils");
const handleVoiceCommand = require("../eventHandlers/voiceCommandHandler");

module.exports = async (message) => {
  const { channel } = message.member.voice;
  if (!channel) {
    return message.reply(
      "You need to be in a voice channel to use this command."
    );
  }

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    connection.receiver.speaking.on("start", (userId) => {
      //console.log(`Started recording for user ${userId}`);
      startRecording(userId, connection.receiver);
    });

    connection.receiver.speaking.on("end", (userId) => {
      stopRecording(userId);
      //console.log(`Stopped recording for user ${userId}`);

      recognizeSpeech(userId, (err, result) => {
        if (err) {
          console.error("Error recognizing speech:", err);
          return;
        }

        const recognizedText = result.toLowerCase().replace(/[^a-z0-9 ]/g, "");
        const words = recognizedText.split(" ");
        const activationWordIndex = words.indexOf("cardinal");
        const textLength = words.length;

        if (
          activationWordIndex !== -1 &&
          activationWordIndex < textLength - 1
        ) {
          const commandWordIndex = activationWordIndex + 1;
          const command = words[commandWordIndex];
          const prompt = words.slice(commandWordIndex + 1).join(" ");
          handleVoiceCommand(command, message, prompt);
        } /*  else {
          console.log(
            "Activation word not found or no command follows the activation word."
          );
        } */
      });
    });

    await message.reply(`Joined ${channel.name}!`);
  } catch (error) {
    console.error(error);
    await message.reply("There was an error joining the voice channel.");
  }
};
