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
          return Hangz.sendMessage(chatId, `❌ Terjadi kesalahan saat mengunduh video.`);
        }
        await Hangz.sendVideo(chatId, res.download.url, {
          caption: res.title || 'Video'
        });
      }
    } catch (e) {
      console.error('Callback error:', e);
      Hangz.sendMessage(chatId, `❌ Terjadi kesalahan: ${e.message}`);
    }
    return;
  }
  switch (data) {
    case 'obfuscate_hard':
      if (premiumUsers.includes(userId)) {
        Hangz.sendMessage(chatId, 'Anda memilih Obfuscate Hard. Silakan kirim file JavaScript.');
      } else {
        Hangz.sendMessage(chatId, 'Fitur ini hanya tersedia untuk pengguna premium.');
      }
      break;
    case 'check_id':
      Hangz.sendMessage(chatId, `ID Telegram Anda: \`${userId}\`.`, { parse_mode: 'Markdown' });
      break;
    case 'feature_list':
      Hangz.sendMessage(chatId, 'Fitur yang tersedia:\n- Obfuscate Hard (Premium)\n- Play YouTube\n- Cek ID Telegram\n- Daftar Fitur\n- Bantuan');
      break;
    case 'help':
      Hangz.sendMessage(chatId, 'Cara menggunakan bot:\n1. Kirim file JavaScript.\n2. Pilih tingkat obfuscation.\n3. Bot akan mengirimkan file yang telah diobfuscate.');
      break;
    case 'play_list':
      Hangz.sendMessage(chatId, 'Silakan ketik perintah seperti\nContoh: /play lathi');
      break;
    default:
      Hangz.sendMessage(chatId, `Error: Perintah tidak dikenali (${data})`);
  }
});

Hangz.onText(/\/play (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  if (!query) return;

  await Hangz.sendMessage(chatId, '🔎 Mencari di YouTube...');

  try {
    let searchResult = await yts(query);
    if (!searchResult.all.length) throw new Error('Tidak ditemukan');

    let video = searchResult.all[0];
    let caption = `${video.title}\n${video.url}\n\nAuthor: ${video.author.name}\nDuration: ${video.timestamp}`;

    await Hangz.sendPhoto(chatId, video.thumbnail, {
      caption: caption,
      reply_markup: {
        inline_keyboard: [[
          { text: 'Dapatkan Video', callback_data: `ytmp4|${video.url}` },
          { text: 'Dapatkan Audio', callback_data: `ytmp3|${video.url}` }
        ]]
      }
    });

  } catch (error) {
    Hangz.sendMessage(chatId, `❌ Terjadi kesalahan: ${error.message}`);
  }
});

Hangz.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;
  const fileName = msg.document.file_name;
  if (!fileName.endsWith('.js')) {
    return Hangz.sendMessage(chatId, '❌ Harap kirim file dengan format .js untuk diobfuscate.');
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
      caption: '✅ Hasil obfuscation telah selesai. Silakan unduh file ini.'
    });
  } catch (error) {
    Hangz.sendMessage(chatId, `❌ Terjadi kesalahan saat mengobfuscate kode: ${error.message}`);
  }
});
        
