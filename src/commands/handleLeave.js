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

    // Leave the voice channel
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        connection.destroy();
        await message.reply(`Left ${channel.name}!`);
    } catch (error) {
        console.error(error);
        await message.reply("There was an error leaving the voice channel.");
    }
};
