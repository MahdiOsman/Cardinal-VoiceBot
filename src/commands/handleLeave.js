/**
 * Leave the voice channel.
 */
const { joinVoiceChannel } = require("@discordjs/voice");
const { startRecording, stopRecording } = require("../utils/audioUtils");

module.exports = async (message) => {
    const { channel } = message.member.voice;
    if (!channel) {
        return message.reply("You need to be in a voice channel to use this command.");
    }

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        connection.receiver.speaking.on("start", (userId) => {
            startRecording(userId, connection.receiver);
        });

        connection.receiver.speaking.on("end", (userId) => {
            stopRecording(userId);
        });

        await message.reply(`Joined ${channel.name}!`);
    } catch (error) {
        console.error(error);
        await message.reply("There was an error joining the voice channel.");
    }
};
