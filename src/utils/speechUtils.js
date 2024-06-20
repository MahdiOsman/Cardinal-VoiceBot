const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { AZURE_SPEECH_KEY, AZURE_REGION } = require("../../config/config.json");

const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
speechConfig.speechRecognitionLanguage = "en-US";

function recognizeSpeech(userId, callback) {
    const filename = `./recordings/${userId}.wav`;
    fs.readFile(filename, (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return;
        }

        const audioConfig = sdk.AudioConfig.fromWavFileInput(data);
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync((result) => {
            callback(result);
            recognizer.close();
        });
    });
}

module.exports = {
    recognizeSpeech,
};
