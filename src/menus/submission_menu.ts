import TelegramBot from 'node-telegram-bot-api';
import {DataBaseHelper} from "../db";
import {Song} from "../types/song";

import {genre_menu} from "./genre_menu"
import {empty_menu} from "./empty_menu"

export function submission_menu (db: DataBaseHelper, song_id: number) :any {
    const song = db.get_song(song_id);
    const t = song.title == "" ? "add title":"edit title";
    const a = song.artists == [] ? "add artist":"edit artists";
    const g = song.genres == [] ? "add genres":"edit genres";

    return  JSON.stringify({ 
        inline_keyboard: [[
            {text: t, callback_data: "submission_menu-title-" + song_id},
            {text: a, callback_data: "submission_menu-artists-" + song_id},
            {text: g, callback_data: "submission_menu-genres-" + song_id}
        ], [
            {text: "submit", callback_data: "submission_menu-submit-" + song_id},
            {text: "cancel", callback_data: "submission_menu-cancel-" + song_id}
        ]]
    });
}

export function submission_text(db: DataBaseHelper, song_id: number) : string {
    const song:Song = db.get_song(song_id);
    return ("<b>" + song.title + "</b>" +
        "\n<b><i>Artists:</i></b>   " + song.artists.map(a => "#" + a + " ").join('') +
        "\n<b><i>Genres:</i></b>  " + song.genres.map(g => "#" + g  + " ").join('') + 
      "\n\n<b><i>Url:</i></b>         " + song.url);
}

export const submission_menu_handler = {pattern: "submission_menu",
    handler: function callback_handler(bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        const action = cbq.data.split("-")[1];
        const song_id = parseInt(cbq.data.split("-")[2]);

        bot.answerCallbackQuery(cbq.id);

        const chat_id = cbq.message.chat.id;
        const msg_id = cbq.message.message_id;
        

        const msg_info : TelegramBot.EditMessageReplyMarkupOptions = {chat_id: chat_id, message_id: msg_id};

        if (action == "submit") {
            bot.sendMessage(chat_id, "Submitted. TODO")
        } else if (action == "cancel") {
            bot.editMessageReplyMarkup(empty_menu(), msg_info)
            bot.deleteMessage(chat_id, "" + msg_id);
        } else if (action == "title") {
            bot.sendMessage(chat_id, "title. TODO");
        } else if (action == "artists") {
            bot.sendMessage(chat_id, "artists. TODO")
        } else if (action == "genres") {
            bot.editMessageReplyMarkup(genre_menu(db, song_id, 0), msg_info)
        }
    }
}