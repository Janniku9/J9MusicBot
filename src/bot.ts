import {DataBaseHelper} from "./db";
import TelegramBot from 'node-telegram-bot-api';
import {TOKEN, CHANNEL} from "./const";

const db:DataBaseHelper = new DataBaseHelper();

const bot : TelegramBot = new TelegramBot(TOKEN, {polling: true});

// GENERAL STUFF

bot.onText(/\/myid/, (msg) => {
    bot.sendMessage(msg.chat.id, `Your ID: <b> ${msg.from?.id} </b>`, {parse_mode: 'HTML'});
});

// GENRE STUFF

bot.onText(/\/genres/, (msg) => {
    const genres = db.get_genres();
    bot.sendMessage(msg.chat.id, `${genres.map(g => "#" + g + " ")}`, {parse_mode: 'HTML'});
});

bot.onText(/\/add_genre/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/remove_genre/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

// MODERATOR STUFF

bot.onText(/\/add_moderator/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/remove_moderator/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/moderators/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

// SUBMISSION STUFF

bot.onText(/\/submit/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/my_submissions/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

// STATS

bot.onText(/\/favourites/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/top/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/feedback/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});