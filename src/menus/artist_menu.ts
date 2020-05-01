import TelegramBot from 'node-telegram-bot-api';
import {DataBaseHelper} from "../db";
import {Song} from "../types/song";
import {Question} from "../types/question";
import {submission_menu, submission_text} from "./submission_menu"

import {sanitize} from "../util/sanitize"

export function artist_menu (db: DataBaseHelper, song_id: number) : any {
    const song: Song = db.get_song(song_id);
    return  JSON.stringify({
            inline_keyboard: [[
                {
                    text: "add artist",
                    callback_data: "artist_menu-add-" + song_id
                },
                {
                    text: "remove artist",
                    callback_data: "artist_menu-remove-" + song_id
                }
            ],[
            {
                text: "go back",
                callback_data: "artist_menu-cancel-" + song_id
            }
            ]]
        });
}

export function artist_add_menu (db: DataBaseHelper, song_id: number) : any {
    const song: Song = db.get_song(song_id);
    return  JSON.stringify({
            inline_keyboard: [[
                {
                    text: "waiting for artist name",
                    callback_data: "artist_add_menu-info-" + song_id
                }
            ],[
            {
                text: "cancel",
                callback_data: "artist_add_menu-cancel-" + song_id
            }
            ]]
        });
}

export function artist_remove_menu (db: DataBaseHelper, song_id: number) : any {
    const song: Song = db.get_song(song_id);
    const artists : string[][] = chunk(song.artists.map(a => ({text: a, callback_data: "artist_remove_menu-" + song_id + "-" + a})), 3);
    console.log(artists[0])
    return  JSON.stringify({
            inline_keyboard: 
                    [
                        artists[0] ? artists[0]:[], artists[1] ? artists[1]:[], artists[2] ? artists[2]:[]
                    ,[
                        {text: "cancel", callback_data: "artist_remove_menu-" + song_id + "close"}
                    ]]
        });
}

export const artist_menu_handler = {pattern: "artist_menu",
    handler: function callback_handler(bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        bot.answerCallbackQuery(cbq.id);

        const user = cbq.from?.id;
        const action = cbq.data.split("-")[1];
        const song_id = parseInt(cbq.data.split("-")[2]);

        if (action == "add") {
            const user = cbq.from?.id;
            db.open_new_question(user, "artist", {song_id: song_id, chat_id: cbq.message.chat.id, message_id: cbq.message.message_id});
            bot.editMessageReplyMarkup(artist_add_menu(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id})
        } else if (action == "remove")
            bot.editMessageReplyMarkup(artist_remove_menu(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id})
        else if (action == "cancel")
            bot.editMessageReplyMarkup(submission_menu(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id})
    }
}

export const artist_remove_menu_handler = {pattern: "artist_remove_menu",
    handler: function callback_handler(bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        bot.answerCallbackQuery(cbq.id);

        const user = cbq.from?.id;
        const action = cbq.data.split("-")[2];
        const song_id = parseInt(cbq.data.split("-")[1]);

        if (action !== "close") {
            db.remove_artist_from_song(song_id, action)    
            bot.editMessageText(submission_text(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id, parse_mode: 'HTML'})
            setTimeout(function() {
                bot.editMessageReplyMarkup(artist_menu(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id}) 
            }, (200));
        } else
            bot.editMessageReplyMarkup(artist_menu(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id}) 
    }
}


export const artist_add_menu_handler = {pattern: "artist_add_menu",
    handler: function callback_handler(bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        bot.answerCallbackQuery(cbq.id);

        const user = cbq.from?.id;
        const action = cbq.data.split("-")[1];
        const song_id = parseInt(cbq.data.split("-")[2]);

        while (action == "cancel" && db.lookup_user(user) !== undefined) {
            const q : Question = db.lookup_user(user);
            db.close_question(q.qid);
        }

        bot.editMessageReplyMarkup(artist_menu(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id})
    }
}

export const artist_question = {type: "artist", 
    handler: function (bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message, q: Question) {
        const song_id = q.options.song_id;

        const artist = sanitize(msg.text).replace(" ", "_").replace("-", "_").toUpperCase(); 
        db.add_artist_to_song(song_id, artist);

        bot.deleteMessage(msg.chat.id, "" + msg.message_id)

        bot.editMessageText(submission_text(db, song_id), {chat_id: q.options.chat_id, message_id: q.options.message_id, parse_mode: 'HTML'})
        setTimeout(function() {
            bot.editMessageReplyMarkup(artist_menu(db, song_id), {chat_id: q.options.chat_id, message_id: q.options.message_id}) 
        }, (200));
    }
}

function chunk (arr, len) {

    var chunks = [],
        i = 0,
        n = arr.length;
  
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
  
    return chunks;
}