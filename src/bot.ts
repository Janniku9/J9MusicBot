import {DataBaseHelper} from "./db";
import TelegramBot from 'node-telegram-bot-api';
import {TOKEN, CHANNEL} from "./const";

const db:DataBaseHelper = new DataBaseHelper();

const bot : TelegramBot = new TelegramBot(TOKEN, {polling: true});

bot.onText(/\/myid/, (msg) => {
    bot.sendMessage(msg.chat.id, `Your ID: ${msg.from?.id}`);
});