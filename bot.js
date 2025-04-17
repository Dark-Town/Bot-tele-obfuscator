const TelegramBot = require('node-telegram-bot-api');
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const ytdl = require('@vreden/youtube_scraper');
const yts = require('yt-search');

const token = '7653249811:AAEk7AzVb4Rcl-8Wb5ZLYqA8SfbD1W7pmqs'; // Replace with your actual bot token
const Hangz = new TelegramBot(token, { polling: true });
const logoPath = path.join(__dirname, 'logo.jpg');
const premiumUsers = [7080079152];

Hangz.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    Hangz.sendPhoto(chatId, fs.readFileSync(logoPath), {
        caption: 'Welcome to the JavaScript Obfuscator Bot!\n\nChoose a menu below:',
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
            await Hangz.sendMessage(chatId, '⏳ Processing, please wait...');
            if (command === 'ytmp3') {
                const res = await ytdl.ytmp3(link);
                if (!res.status || !res.download?.url) {
                    return Hangz.sendMessage(chatId, '❌ An error occurred while downloading audio.');
                }
                await Hangz.sendAudio(chatId, res.download.url, {}, {
                    filename: `${res.title || 'audio'}.mp3`
                });
            }
            if (command === 'ytmp4') {
                const res = await ytdl.ytmp4(link);
                if (!res.status || !res.download?.url) {
                    return Hangz.sendMessage(chatId, '❌ An error occurred while downloading video.');
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
            Hangz.sendMessage(chatId, `Your Telegram ID: ${userId}.`, { parse_mode: 'Markdown' });
            break;
        case 'feature_list':
            Hangz.sendMessage(chatId, 'Available features:\n- Obfuscate Hard (Premium)\n- Play YouTube\n- Check Telegram ID\n- Feature List\n- Help');
            break;
        case 'help':
            Hangz.sendMessage(chatId, 'How to use the bot:\n1. Send a JavaScript file.\n2. Choose the level of obfuscation.\n3. The bot will send back the obfuscated file.');
            break;
        case 'play_list':
            Hangz.sendMessage(chatId, 'Please type a command like\nExample: /play lathi');
            break;
        default:
            Hangz.sendMessage(chatId, `Error: Unrecognized command (${data})`);
 ...
