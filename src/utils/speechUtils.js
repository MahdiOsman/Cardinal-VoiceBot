const fs = require("fs");
const { OpenAI } = require("openai");
const { OPENAI_API_KEY } = require("../../config/config.json");

const openai = new OpenAI({apiKey: OPENAI_API_KEY});

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

async function recognizeSpeech(userId, callback) {
  const filename = `./recordings/${userId}.wav`;

  fs.readFile(filename, async (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      callback(err, null);
      return;
    }

    try {
      const audioFilePath = `./recordings/${userId}.wav`;
      fs.writeFileSync(audioFilePath, data);

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: "whisper-1",
      });

      console.log(`RECOGNIZED: ${transcription.text}`);

      // TODO: LOGS FOR TESTING PURPOSES DELETE LATER
      log(`${userId}: ${transcription.text}`);
      // END OF LOGS

      callback(null, transcription.text);
    } catch (error) {
      console.error("Error during speech recognition:", error);
      callback(error, null);
    }
  });
}

module.exports = recognizeSpeech;
