const fs = require("fs");
const path = require("path");
const wav = require("wav");
const prism = require("prism-media");

const userStreams = {};

function startRecording(userId, receiver, onStopCallback) {
  /* console.log(`Started recording for user ${userId}`); */
  const audioStream = receiver.subscribe(userId, {
    end: {
      behavior: "silence",
    },
  });

  const filename = path.join(__dirname, `../../recordings/${userId}.wav`);
  if (!fs.existsSync(path.dirname(filename))) {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }

  const fileStream = fs.createWriteStream(filename);
  const writer = new wav.FileWriter(filename, {
    sampleRate: 48000,
    channels: 1,
  });

  const decoder = new prism.opus.Decoder({
    frameSize: 960,
    channels: 1,
    rate: 48000,
  });

  audioStream.pipe(decoder).pipe(writer);

  audioStream.on("end", () => {
    writer.end();
    if (onStopCallback) onStopCallback();
  });

  userStreams[userId] = { audioStream, fileStream, writer };
}

function stopRecording(userId) {
  /* console.log(`Stopped recording for user ${userId}`); */
  const streams = userStreams[userId];
  if (streams) {
    streams.audioStream.destroy();
    streams.writer.end();
    delete userStreams[userId];
  }
}

module.exports = {
  startRecording,
  stopRecording,
};
