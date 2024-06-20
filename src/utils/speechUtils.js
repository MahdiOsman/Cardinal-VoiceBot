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

    const audioConfig = sdk.AudioConfig.fromWavFileInput(data);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync((result) => {
      switch (result.reason) {
        case sdk.ResultReason.RecognizedSpeech:
          console.log(`RECOGNIZED: ${result.text}`);
          //TODO: LOGS FOR TESTING PURPOSES DELETE LATER
          log(`${userId}: ${result.text}`);
          // END OF LOGS
          callback(null, result.text);
          break;
        case sdk.ResultReason.NoMatch:
          console.log("NOMATCH: Speech could not be recognized.");
          //callback(new Error("Speech could not be recognized."), null);
          break;
        case sdk.ResultReason.Canceled:
          const cancellation = sdk.CancellationDetails.fromResult(result);
          console.log(`CANCELED: Reason=${cancellation.reason}`);
          if (cancellation.reason === sdk.CancellationReason.Error) {
            console.error(`CANCELED: ErrorCode=${cancellation.errorCode}`);
            console.error(
              `CANCELED: ErrorDetails=${cancellation.errorDetails}`
            );
          }
          //callback(new Error("Recognition canceled."), null);
          break;
      }
      recognizer.close();
    });
  });
}

module.exports = recognizeSpeech;
