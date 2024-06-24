const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { AZURE_SPEECH_KEY, AZURE_REGION } = require("../../config/config.json");

const speechConfig = sdk.SpeechConfig.fromSubscription(
  AZURE_SPEECH_KEY,
  AZURE_REGION
);
speechConfig.speechRecognitionLanguage = "en-US";

function log(text) {
  const folder = "./logs";
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  const filename = `${folder}/speech.log`;

  // Create file if it doesn't exist
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, "", (err) => {
      if (err) {
        console.error("Error creating log file:", err);
      }
    });
  }

  // Append to file
  fs.appendFile(filename, `${new Date().toISOString()} - ${text}\n`, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
}

function recognizeSpeech(userId, callback) {
  const filename = `./recordings/${userId}.wav`;
  fs.readFile(filename, (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      callback(err, null);
      return;
    }

    // Create an audio configuration from the file buffer
    const audioConfig = sdk.AudioConfig.fromWavFileInput(data);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync((result) => {
      let errorOccurred = false;

      switch (result.reason) {
        case sdk.ResultReason.RecognizedSpeech:
          console.log(`RECOGNIZED: ${result.text}`);

          // Log the recognized text
          log(`${userId}: ${result.text}`);

          // Call the callback with the recognized text
          callback(null, result.text);
          break;
        case sdk.ResultReason.NoMatch:
          console.log("NOMATCH: Speech could not be recognized.");
          callback(new Error("Speech could not be recognized."), null);
          errorOccurred = true;
          break;
        case sdk.ResultReason.Canceled:
          const cancellation = sdk.CancellationDetails.fromResult(result);
          console.log(`CANCELED: Reason=${cancellation.reason}`);
          if (cancellation.reason === sdk.CancellationReason.Error) {
            console.error(`CANCELED: ErrorCode=${cancellation.errorCode}`);
            console.error(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
          }
          callback(new Error("Recognition canceled."), null);
          errorOccurred = true;
          break;
        default:
          console.error("Unknown recognition result reason.");
          callback(new Error("Unknown recognition result reason."), null);
          errorOccurred = true;
          break;
      }

      if (!errorOccurred) {
        recognizer.close();
      }
    }, (err) => {
      console.error("Error during speech recognition:", err);
      callback(err, null);
      recognizer.close();
    });
  });
}

module.exports = recognizeSpeech;
