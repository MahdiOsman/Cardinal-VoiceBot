/**
 * Join a voice channel and start recording audio.
 */
const { joinVoiceChannel } = require("@discordjs/voice");
const { startRecording, stopRecording } = require("../utils/audioUtils");
const recognizeSpeech = require("../utils/speechUtils");
const handleVoiceCommand = require("../eventHandlers/voiceCommandHandler");
const { OPENAI_API_KEY } = require("../../config/config.json");
const { OpenAI } = require("openai");
const openai = new OpenAI({apiKey: OPENAI_API_KEY});

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

    connection.receiver.speaking.on("end", async (userId) => {
      stopRecording(userId);
      //console.log(`Stopped recording for user ${userId}`);

      recognizeSpeech(userId, async (err, result) => {
        if (err) {
          console.error("Error recognizing speech:", err);
          return;
        }
        const recognizedText = result.toLowerCase().replace(/[^a-z0-9 ]/g, "");
        const words = recognizedText.split(" ");
        const activationWordIndex = words.indexOf("cardinal");
        const commandWordIndex = activationWordIndex + 1;
        const textLength = words.length;

        const commandWord = await getCommandFromContext(recognizedText);
        console.log(`Command: ${commandWord}`);
        if (words[commandWordIndex] != commandWord) {
          words.splice(commandWordIndex, 0, commandWord);
        }
        if (
          activationWordIndex !== -1 &&
          activationWordIndex < textLength - 1
        ) {
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


async function getCommandFromContext(prompt) {
  /*  Prompt: `Using this message: "${prompt}" determine the appropriate command that is required and then return only the command value from the list: "leave,skip,pause,unpause,play,mute,stop,volume,search,none,"`;
   */ try {
    const data = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Using this message: '${prompt}', determine the appropriate command that is attempted to be used and output only the chosen command from the list without any other text (Make any question equal 'search'): 'leave, skip, pause, unpause, resume, play, mute, stop, volume, search, browse, none,'`,
        },
      ],
      model: "gpt-3.5-turbo-16k",
    });

    const response = data.choices[0].message.content;
    /* console.log(`Command: ${response}`); */
    return response;
  } catch (error) {
    console.error(`Error getting response: ${error.message}`);
    return;
  }
}
