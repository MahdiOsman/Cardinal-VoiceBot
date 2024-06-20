const fs = require("fs");
const ElevenLabs = require("elevenlabs-node");
const { XI_API_KEY } = require("../../config/config.json");

const voice = new ElevenLabs({
    apiKey: XI_API_KEY,
    voiceId: "XB0fDUnXU5powFXDhCwa",
});

async function createOrUpdateAudioFile(userId, textResponse) {
    const fileName = `./recordings/${userId}.mp3`;

    try {
        const res = await voice.textToSpeech({
            fileName,
            textInput: textResponse,
            voiceId: "iP95p4xoKVk53GoZ742B",
            stability: 0.5,
            similarityBoost: 0.5,
            modelId: "eleven_multilingual_v2",
            style: 1,
            responseType: "buffer",
            speakerBoost: true,
        });

        if (Buffer.isBuffer(res)) {
            fs.writeFileSync(fileName, res);
        }
    } catch (error) {
        console.error(`Error generating speech: ${error.message}`);
    }
}

module.exports = {
    createOrUpdateAudioFile,
};
