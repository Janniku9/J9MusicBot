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
    bot.sendMessage(msg.chat.id, `${genres.map(g => "#" + g + " ").join('')}`, {parse_mode: 'HTML'});
});

bot.onText(/\/add_genre/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/remove_genre/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

// MODERATOR STUFF

bot.onText(/\/add_moderator/, (msg) => {
    const from = "" + msg.from?.id;
    if (db.is_moderator(from)) {
        const args = msg.text.match(/(\/add_moderator)((\s?)((\d+)(\s)([^\s]+)))?/); 
        // 4 is pair, 5 is id and 7 is name
        if (args[4] == undefined)
            bot.sendMessage(msg.chat.id, "Argument Error");
        else {
            if (db.add_moderator({id: args[5], name: args[7]}))
                bot.sendMessage(msg.chat.id, args[7] + " has been promoted to moderator");
            else
                bot.sendMessage(msg.chat.id, args[7] + " already is a moderator");
        }
    } else 
        bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
});

bot.onText(/\/remove_moderator/, (msg) => {
    const from = "" + msg.from?.id;
    if(db.is_moderator(from)) {
        const args = msg.text.match(/(\/remove_moderator)((\s?)((\d+)))?/);
        if (args[4] == undefined)
            bot.sendMessage(msg.chat.id, "Argument Error");
        else {
            const mod = db.lookup_mode_name(args[4]);
            if (mod != undefined) {
                db.remove_moderator(args[4]);
                bot.sendMessage(msg.chat.id, mod.name + " is now no longer a moderator")
            } else
                bot.sendMessage(msg.chat.id, args[4] + " is not a valid moderator id")
        }
    } else 
        bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
});

bot.onText(/\/moderators/, (msg) => {
    const from = "" + msg.from?.id;
    if (db.is_moderator(from)) {
        const mods = db.get_moderators();
        bot.sendMessage(msg.chat.id, `<b>MODERATORS</b> \n\n${mods.map(m => "" + m.id + " | " + m.name + "\n").join('')}`, {parse_mode: 'HTML'});
    } else
        bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
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