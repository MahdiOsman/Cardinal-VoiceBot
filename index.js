// Import necessary libraries
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection, EndBehaviorType } = require("@discordjs/voice");
const { token, XI_API_KEY, AZURE_SPEECH_KEY, AZURE_REGION } = require("./config.json");
const prism = require("prism-media");
const fs = require("fs");
const path = require("path");
const wav = require("wav");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const ElevenLabs = require("elevenlabs-node");

// Azure Speech SDK configuration
const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
speechConfig.speechRecognitionLanguage = "en-US";

// Create a new Discord client instance with specific intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

let msgGlobal = null;

// Event handler when the bot is ready
client.once("ready", () => {
    console.log("Bot is online!");
});

// Event handler for when a message is created
client.on("messageCreate", async (message) => {
    msgGlobal = message;
    // Ignore messages from bots
    if (message.author.bot) return;

    // Handle the ?ping command
    if (message.content === "?ping") {
        await message.reply("Pong!");
    }

    // Handle the ?join command
    if (message.content === "?join") {
        const { channel } = message.member.voice;
        if (!channel) {
            return message.reply("You need to be in a voice channel to use this command.");
        }

        try {
            // Join the voice channel
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            // Start recording when a user starts speaking
            connection.receiver.speaking.on("start", (userId) => {
                startRecording(userId, connection.receiver);
            });

            // Stop recording when a user stops speaking
            connection.receiver.speaking.on("end", (userId) => {
                stopRecording(userId);
            });

            await message.reply(`Joined ${channel.name}!`);
        } catch (error) {
            console.error(error);
            await message.reply("There was an error joining the voice channel.");
        }
    }

    // Handle the ?leave command
    if (message.content === "?leave") {
        const { channel } = message.member.voice;
        if (!channel) {
            return message.reply("You need to be in a voice channel to use this command.");
        }

        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            await message.reply(`Left ${channel.name}!`);
        } else {
            await message.reply("I am not in a voice channel.");
        }
    }
});

// Function to start recording audio from a user
function startRecording(userId, receiver) {
    const audioStream = receiver.subscribe(userId, {
        end: {
            behavior: EndBehaviorType.Manual,
        },
    });

    const filename = path.join(__dirname, `recordings/${userId}.wav`);
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
    });

    userStreams[userId] = { audioStream, fileStream, writer };
}

// Function to stop recording audio from a user
function stopRecording(userId) {
    const streams = userStreams[userId];
    if (streams) {
        streams.audioStream.destroy();
        streams.writer.end();
        delete userStreams[userId];
    }
    recognizeSpeech(userId);
}

// Function to perform speech recognition
function recognizeSpeech(userId) {
    const filename = `./recordings/${userId}.wav`;
    fs.readFile(filename, (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return;
        }

        const audioConfig = sdk.AudioConfig.fromWavFileInput(data);
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync((result) => {
            switch (result.reason) {
                case sdk.ResultReason.RecognizedSpeech:
                    console.log(`RECOGNIZED: ${result.text}`);
                    getEventTypeFromSpeech(result.text);
                    break;
                case sdk.ResultReason.NoMatch:
                    console.log("NOMATCH: Speech could not be recognized.");
                    break;
                case sdk.ResultReason.Canceled:
                    const cancellation = sdk.CancellationDetails.fromResult(result);
                    console.log(`CANCELED: Reason=${cancellation.reason}`);
                    if (cancellation.reason === sdk.CancellationReason.Error) {
                        console.error(`CANCELED: ErrorCode=${cancellation.errorCode}`);
                        console.error(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                    }
                    break;
            }
            recognizer.close();
        });
    });
}

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

async function getEventTypeFromSpeech(inputVal) {
    try {
        const activateSystemWord = "Cardinal";

        // Remove special characters and split input value
        let inputValInitial = inputVal.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().split(" ");

        // Check if the first word matches the activation word
        if (inputValInitial[0] === activateSystemWord.toLowerCase()) {
            const command = inputValInitial[1];

            switch (command) {
                case "leave":
                case "disconnect":
                case "disappear":
                case "vanish":
                    await handleLeaveCommand();
                    break;
                case "play":
                    await handlePlayCommand();
                    break;
                case "skip":
                case "next":
                    await handleSkipCommand();
                    break;
                case "pause":
                    await handlePauseCommand();
                    break;
                case "mute":
                    await handleMuteCommand();
                    break;
                default:
                    console.log(`Command ${command} not recognized`);
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

async function handleLeaveCommand() {
    const { channel } = msgGlobal.member.voice;
    const connection = getVoiceConnection(msgGlobal.guild.id);
    if (connection) {
        connection.destroy();
        await msgGlobal.reply(`Left ${channel.name}!`);
    } else {
        await msgGlobal.reply("I am not in a voice channel.");
    }
}

async function handlePlayCommand() {
    console.log("Playing Music!");
}

async function handleSkipCommand() {
    console.log("Skipped Music!");
}

async function handlePauseCommand() {
    console.log("Paused Music!");
}

async function handleMuteCommand() {
    console.log("Music Stopped!");
}


const userStreams = {};

client.login(token);
