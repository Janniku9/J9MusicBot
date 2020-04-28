import TelegramBot from 'node-telegram-bot-api';
import {DataBaseHelper} from "../db";
import {Song} from "../types/song";

import {submission_menu, submission_text} from "./submission_menu";

export function genre_menu(db: DataBaseHelper, song_id: number, page: number) : any {
    const used_genres = db.get_song(song_id).genres;
    const genres = db.get_genres();
    const total_pages: number = Math.ceil(genres.length/12.0);
    const left_page: number = (page -1 + total_pages) % total_pages;
    const right_page: number = (page + 1) % total_pages;
    
    const left_bound = 12 * page;
    const right_bound = Math.min(12 * (page+1), genres.length);
    const p = genres.slice(left_bound, right_bound).map(g => ({text: (used_genres.find(a => a == g) == undefined ? "": "✅ ") + "#" + g, callback_data: "genre_menu_selection-" + page + "-" + g + "-" + song_id}))
    return JSON.stringify({
        inline_keyboard: [
            p.slice(0,3), p.slice(3,6), p.slice(6,9), p.slice(9,12) 
        ,[
        {
            text: "<",
            callback_data:  "genre_menu_switch-" + left_page + "-" + song_id
        },
        {
            text: "done!",
            callback_data:  "genre_menu_switch-" + "done" + "-" + song_id
        },
        {
            text: ">",
            callback_data: "genre_menu_switch-" + right_page + "-" + song_id
        }
        ]]
    });
}

export const genre_menu_switch_handler = {pattern: "genre_menu_switch", 
    handler: function callback_handler (bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        bot.answerCallbackQuery(cbq.id);

        const pattern = cbq.data.split("-")[0];
        const action = cbq.data.split("-")[1];
        const song_id = parseInt(cbq.data.split("-")[2]);

        const chat_id = cbq.message.chat.id;
        const msg_id = cbq.message.message_id;
        const msg_info = {chat_id: chat_id, message_id: msg_id};

        if (action == 'done')
            bot.editMessageReplyMarkup(submission_menu(db, song_id), msg_info)
        else
            bot.editMessageReplyMarkup(genre_menu(db, song_id, parseInt(action)), msg_info)
    }
}

export const genre_menu_selection_handler = {pattern: "genre_menu_selection", 
    handler: function callback_handler (bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        const page = parseInt(cbq.data.split("-")[1]);
        const genre = cbq.data.split("-")[2];
        const song_id = parseInt(cbq.data.split("-")[3]);

        bot.answerCallbackQuery(cbq.id);
        const chat_id = cbq.message.chat.id;
        const msg_id = cbq.message.message_id;

        if (db.get_song(song_id).genres.find(g => g == genre)) {
            db.remove_genre_from_song(song_id, genre);
        } else {
            db.add_genre_to_song(song_id, genre);
        }

        bot.editMessageText(submission_text(db, song_id), {chat_id: chat_id, message_id: msg_id, parse_mode: 'HTML'})
        setTimeout(function() {
            bot.editMessageReplyMarkup(genre_menu(db, song_id, page), {chat_id: chat_id, message_id: msg_id})
        }, (200));
    }
}