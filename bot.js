const TelegramBot = require('node-telegram-bot-api');
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const ytdl = require('@vreden/youtube_scraper');
const yts = require('yt-search');
const token = '7653249811:AAEk7AzVb4Rcl-8Wb5ZLYqA8SfbD1W7pmqs';
const Hangz = new TelegramBot(token, { polling: true });
const logoPath = path.join(__dirname, 'logo.jpg');
const premiumUsers = [7080079152];
const app = express();

// Set the port from environment variable or fallback to 3000
const PORT = process.env.PORT || 3000;

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, this is your Telegram bot server running!');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(Express server is running on port ${PORT});
});

// Example of handling a Telegram message
Hangz.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Example response to a specific command
  if (msg.text === '/start') {
    Hangz.sendMessage(chatId, 'Welcome to the Hangz bot! How can I assist you today?');
  } else if (msg.text === '/premium') {

Hangz.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  Hangz.sendPhoto(chatId, fs.readFileSync(logoPath), {
    caption: `Welcome to Paid Tech Zone Best 2025 Bot!\n\nChoose a menu below:`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Feature List', callback_data: 'feature_list' },
          { text: 'Obfuscate Hard', callback_data: 'obfuscate_hard' },
          { text: 'Help', callback_data: 'help' },
        ],
        [{ text: 'Check Telegram ID', callback_data: 'check_id' }],
        [{ text: 'Play Video or Song', callback_data: 'play_list' }]
      ],
    },
  });
});

Hangz.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;
  if (data.startsWith('ytmp3|') || data.startsWith('ytmp4|')) {
    const [command, link] = data.split('|');
    if (!link || !link.startsWith('https://')) {
      return Hangz.sendMessage(chatId, '❌ The link is not valid.');
    }
    try {
      await Hangz.sendMessage(chatId, '⏳ Processing, please wait...');
      if (command === 'ytmp3') {
        const res = await ytdl.ytmp3(link);
        if (!res.status || !res.download?.url) {
          return Hangz.sendMessage(chatId, `❌ An error occurred while downloading the audio.`);
        }
        await Hangz.sendAudio(chatId, res.download.url, {}, {
          filename: `${res.title || 'audio'}.mp3`
        });
      }
      if (command === 'ytmp4') {
        const res = await ytdl.ytmp4(link);
        if (!res.status || !res.download?.url) {
          return Hangz.sendMessage(chatId, `❌ An error occurred while downloading the video.`);
        }
        await Hangz.sendVideo(chatId, res.download.url, {
          caption: res.title || 'Video'
        });
      }
    } catch (e) {
      console.error('Callback error:', e);
      Hangz.sendMessage(chatId, `❌ An error occurred: ${e.message}`);
    }
    return;
  }
  switch (data) {
    case 'obfuscate_hard':
      if (premiumUsers.includes(userId)) {
        Hangz.sendMessage(chatId, 'You selected Obfuscate Hard. Please send the JavaScript file.');
      } else {
        Hangz.sendMessage(chatId, 'This feature is only available for premium use.');
      }
      break;
    case 'check_id':
      Hangz.sendMessage(chatId, `Your Telegram ID: \`${userId}\`.`, { parse_mode: 'Markdown' });
      break;
    case 'feature_list':
      Hangz.sendMessage(chatId, 'Available features:\n- Obfuscate Hard (Premium)\n- Play YouTube\n- Check Telegram ID\n- Feature List\n- Help');
      break;
    case 'help':
      Hangz.sendMessage(chatId, 'How to use the bot:\n1. Send a JavaScript file.\n2. Choose the level of obfuscation.\n3. The bot will send back the obfuscated file. \n4. Join our channel https://t.me/paidtechzone.');
      break;
    case 'play_list':
      Hangz.sendMessage(chatId, 'Please type the command like\nExample: /play lil crone');
      break;
    default:
      Hangz.sendMessage(chatId, `Error: Command not recognized (${data})`);
  }
});

Hangz.onText(/\/play (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  if (!query) return;

  await Hangz.sendMessage(chatId, '🔎 Searching on YouTube...');

  try {
    let searchResult = await yts(query);
    if (!searchResult.all.length) throw new Error('Not found');

    let video = searchResult.all[0];
    let caption = `${video.title}\n${video.url}\n\nAuthor: ${video.author.name}\nDuration: ${video.timestamp}`;

    await Hangz.sendPhoto(chatId, video.thumbnail, {
      caption: caption,
      reply_markup: {
        inline_keyboard: [[
          { text: 'Download Video', callback_data: `ytmp4|${video.url}` },
          { text: 'Download Audio', callback_data: `ytmp3|${video.url}` }
        ]]
      }
    });

  } catch (error) {
    Hangz.sendMessage(chatId, `❌ An error occurred.: ${error.message}`);
  }
});

Hangz.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;
  const fileName = msg.document.file_name;
  if (!fileName.endsWith('.js')) {
    return Hangz.sendMessage(chatId, '❌ Please send the file in .js format to be obfuscated.');
  }
  try {
    const file = await Hangz.getFile(fileId);
    const filePath = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    const response = await fetch(filePath);
    const code = await response.text();
    const options = {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      debugProtection: true,
      disableConsoleOutput: true,
      selfDefending: true,
      splitStrings: true,
      stringArray: true,
      stringArrayEncoding: ['rc4', 'base64'],
      stringArrayThreshold: 1,
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      numbersToExpressions: true,
      stringArrayWrappersCount: 10,
      stringArrayWrappersType: 'function',
      stringArrayRotate: true,
      stringArrayShuffle: true,
      splitStringsChunkLength: 2,
      simplify: false,
      shuffleIdentifiers: true
    };
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, options).getObfuscatedCode();
    const outputPath = path.join(__dirname, 'result.js');
    fs.writeFileSync(outputPath, obfuscatedCode);
    Hangz.sendDocument(chatId, fs.createReadStream(outputPath), {
      caption: '✅ The obfuscation result is complete. Please download this file.'
    });
  } catch (error) {
    Hangz.sendMessage(chatId, `❌ An error occurred while obfuscating the code.: ${error.message}`);
  }
});
        
