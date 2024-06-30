const { OPENAI_API_KEY } = require("../../config/config.json");
const { OpenAI } = require("openai");
/* const path = require("path");
const fs = require("fs"); */

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function getAiResponse(message, prompt) {
  try {
    const data = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo-16k",
    });

    const response = data.choices[0].message.content;
    message.reply(response);
  } catch (error) {
    console.error(`Error getting response: ${error.message}`);
  }
}

/* async function textToSpeech(message, response) {
  try {
    const audioFile = "openai-ai-response";
    const responseAudioFile = path.resolve(`./recordings/${audioFile}.mp3`);
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: response,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(responseAudioFile, buffer);
  } catch (error) {
    console.error(`Error getting response: ${error.message}`);
    await message.reply(
      "There was an error trying to convert text to speech data."
    );
  }
} */

module.exports = {
  getAiResponse,
};
