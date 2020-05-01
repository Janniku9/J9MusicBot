import TelegramBot from 'node-telegram-bot-api';
import {DataBaseHelper} from "../db";
import {Song} from "../types/song";
import {Question} from "../types/question";

import {genre_menu} from "./genre_menu"
import {empty_menu} from "./empty_menu"
import {title_menu} from "./title_menu"
import {artist_menu} from "./artist_menu"
import {post_menu} from "./post_menu"
import {notes_menu} from "./notes_menu"
import {application_menu} from "./application_menu"

import {post_song} from "../util/post"

export function submission_menu (db: DataBaseHelper, song_id: number) :any {
    const song = db.get_song(song_id);
    const t = song.title == "" ? "add title":"edit title";
    const a = song.artists.length == 0 ? "add artist":"edit artists";
    const g = song.genres.length == 0 ? "add genres":"edit genres";
    const n = song.notes == "" ? "add notes":"edit notes";

    return  JSON.stringify({ 
        inline_keyboard: [[
            {text: t, callback_data: "submission_menu-title-" + song_id},
            {text: a, callback_data: "submission_menu-artists-" + song_id},
            {text: g, callback_data: "submission_menu-genres-" + song_id}
        ],[
            {text: n, callback_data: "submission_menu-notes-" + song_id}
        ],[
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
        (song.notes != "" ? ("\n<b><i>Notes:</i></b>    " + song.notes) : "") + 
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
            if(db.is_trusted("" + cbq.from?.id)) {
                post_song(bot, db, song_id);
            } else
                bot.sendMessage(cbq.message.chat.id, "Waiting for approval!")
                bot.editMessageReplyMarkup(empty_menu(), msg_info)
                
                bot.sendMessage(db.get_owner().id, submission_text(db, song_id), {parse_mode: 'HTML', reply_markup: application_menu(db, song_id)})
        } else if (action == "cancel") {
            bot.editMessageReplyMarkup(empty_menu(), msg_info)
            bot.deleteMessage(chat_id, "" + msg_id);
        } else if (action == "title") {
            const user = cbq.from?.id;
            bot.editMessageReplyMarkup(title_menu(db, song_id), msg_info);
            db.open_new_question(user, "title", {song_id: song_id, chat_id: chat_id, message_id: msg_id})
        } else if (action == "artists") {
            bot.editMessageReplyMarkup(artist_menu(db, song_id), msg_info);
        } else if (action == "notes") {
            const user = cbq.from?.id;
            bot.editMessageReplyMarkup(notes_menu(db, song_id), msg_info);
            db.open_new_question(user, "notes", {song_id: song_id, chat_id: chat_id, message_id: msg_id})
        }else if (action == "genres") {
            bot.editMessageReplyMarkup(genre_menu(db, song_id, 0), msg_info)
        }
    }
}