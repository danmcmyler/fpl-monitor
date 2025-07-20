const axios = require("axios");
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = "7648386501:AAG4rXvVJ2UALxx7mJwvE31wyPoNIcrk_QU";
const TELEGRAM_CHAT_ID = "6069170605";
const APP_ID = "1138895159"; // Replace with the actual App Store app ID
const STATE_FILE = "lastVersion.txt";
const CHECK_INTERVAL_MS = 30 * 1000;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

async function checkAppVersion() {
    try {
        const res = await axios.get(`https://itunes.apple.com/lookup?id=${APP_ID}`);
        const app = res.data.results[0];
        const currentVersion = app.version;

        const oldVersion = fs.existsSync(STATE_FILE) ? fs.readFileSync(STATE_FILE, "utf8") : "";

        if (currentVersion !== oldVersion) {
            fs.writeFileSync(STATE_FILE, currentVersion);
            await bot.sendMessage(
                TELEGRAM_CHAT_ID,
                `📲 App version changed!\nNew version: ${currentVersion}\n${app.trackViewUrl}`
            );
            console.log("Version change detected and message sent.");
        } else {
            console.log("No change.");
        }
    } catch (err) {
        console.error("Error checking app version:", err.message);
    }
}

setInterval(checkAppVersion, CHECK_INTERVAL_MS);
checkAppVersion(); // initial run
