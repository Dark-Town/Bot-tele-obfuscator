const TelegramBot = require('node-telegram-bot-api');
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const ytdl = require('@vreden/youtube_scraper');
const yts = require('yt-search');
const token = '8104653263:AAGBJug5XeN09C4h-bkjTjdSDwzHNJHB9vc';
const Hangz = new TelegramBot(token, { polling: true });
const logoPath = path.join(__dirname, 'logo.jpg');
const premiumUsers = [7080079152];

Hangz.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  Hangz.sendPhoto(chatId, fs.readFileSync(logoPath), {
    caption: `Welcome to the Paid Tech Zone Bot!\n\nChoose a menu below:`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Feature List', callback_data: 'feature_list' },
          { text: 'Obfuscate Hard', callback_data: 'obfuscate_hard' },
          { text: 'Help', callback_data: 'help' },
        ],
        [{ text: 'Check Telegram ID', callback_data: 'check_id' }],
        [{ text: 'Play Song', callback_data: 'play_list' }]
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
      return Hangz.sendMessage(chatId, '❌ Invalid link.');
    }
    try {
      await Hangz.sendMessage(chatId, '⏳ Downloading, please wait...');
      if (command === 'ytmp3') {
        const res = await ytdl.ytmp3(link);
        if (!res.status || !res.download?.url) {
          return Hangz.sendMessage(chatId, `❌ An error occurred while downloading audio.`);
        }
        await Hangz.sendAudio(chatId, res.download.url, {}, {
          filename: `${res.title || 'audio'}.mp3`
        });
      }
      if (command === 'ytmp4') {
        const res = await ytdl.ytmp4(link);
        if (!res.status || !res.download?.url) {
          return Hangz.sendMessage(chatId, `❌ An error occurred while downloading video.`);
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
        Hangz.sendMessage(chatId, 'You have chosen Obfuscate Hard. Please send a JavaScript file.');
      } else {
        Hangz.sendMessage(chatId, 'This feature is only available for premium users.');
      }
      break;
    case 'check_id':
      Hangz.sendMessage(chatId, `Your Telegram ID: \`${userId}\`.`, { parse_mode: 'Markdown' });
      break;
    case 'feature_list':
      Hangz.sendMessage(chatId, 'Available features:\n- Obfuscate Hard (Premium)\n- Play YouTube\n- Check Telegram ID\n- Feature List\n- Help');
      break;
    case 'help':
      Hangz.sendMessage(chatId, 'Choose the level of obfuscation.\n3. The bot will send back the obfuscated file.');
      break;
    case 'play_list':
      Hangz.sendMessage(chatId, 'Please type a command like\nExample: /play Lil crone');
      break;
    default:
      Hangz.sendMessage(chatId, `Error: Unrecognized command  (${data})`);
  }
});

Hangz.onText(/\/play (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  if (!query) return;

  await Hangz.sendMessage(chatId, '🔎 Searching Your Item on YouTube...');

  try {
    let searchResult = await yts(query);
    if (!searchResult.all.length) throw new Error('Error Search please contact owner');

    let video = searchResult.all[0];
    let caption = `${video.title}\n${video.url}\n\nAuthor: ${video.author.name}\nDuration: ${video.timestamp}`;

    await Hangz.sendPhoto(chatId, video.thumbnail, {
      caption: caption,
      reply_markup: {
        inline_keyboard: [[
          { text: 'Download Video', callback_data: `ytmp4|${video.url}` },
          { text: 'Download Song', callback_data: `ytmp3|${video.url}` }
        ]]
      }
    });

  } catch (error) {
    Hangz.sendMessage(chatId, `❌ An error occurred: ${error.message}`);
  }
});

Hangz.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;
  const fileName = msg.document.file_name;
  if (!fileName.endsWith('.js')) {
    return Hangz.sendMessage(chatId, '❌ Please send a file in .js format to obfuscate.');
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
    Hangz.sendMessage(chatId, `❌ An error occurred while obfuscating the code: ${error.message}`);
  }
});
                                   
