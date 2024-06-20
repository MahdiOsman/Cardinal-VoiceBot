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

                const recognizedText = result.toLowerCase();
                console.log(`Recognized text: ${recognizedText}`);
                recognizedText.replace(",", "");
                // Check if the recognized text starts with "cardinal"
                if (recognizedText.startsWith("cardinal")) {
                    const command = recognizedText.split(" ")[1];
                    const prompt = recognizedText.split(" ").slice(2).join(" ");
                    handleVoiceCommand(command, message, prompt);
                }
            });
        });

        await message.reply(`Joined ${channel.name}!`);
    } catch (error) {
        console.error(error);
        await message.reply("There was an error joining the voice channel.");
    }
};
