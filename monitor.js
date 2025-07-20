const fs = require("fs");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = "7648386501:AAG4rXvVJ2UALxx7mJwvE31wyPoNIcrk_QU";
const TELEGRAM_CHAT_ID = "6069170605";
const CHECK_URL = "https://fantasy.premierleague.com/";
const STATE_FILE = "lastState.json";
const CHECK_INTERVAL_MS = 60 * 1000;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

async function checkSite() {
    let prevState = { status: null, content: "" };
    if (fs.existsSync(STATE_FILE)) {
        try {
            prevState = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
        } catch { }
    }

    try {
        const res = await axios.get(CHECK_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
                "Accept-Language": "en-GB,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1"
            },
            timeout: 10000,
            decompress: true,
            validateStatus: () => true
        });

        const newState = {
            status: res.status,
            content: res.status === 200 ? res.data : ""
        };

        const changed =
            newState.status !== prevState.status ||
            (newState.status === 200 && newState.content !== prevState.content);

        if (changed) {
            fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));
            await bot.sendMessage(
                TELEGRAM_CHAT_ID,
                `⚽ FPL status changed!\nStatus: ${newState.status}\nhttps://fantasy.premierleague.com/`
            );
            console.log("Change detected and message sent.");
        } else {
            console.log("No change.");
        }
    } catch (err) {
        console.error("Error checking FPL site:", err.message);
    }
}

setInterval(checkSite, CHECK_INTERVAL_MS);
checkSite();
