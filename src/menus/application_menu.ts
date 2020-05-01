import TelegramBot from 'node-telegram-bot-api';
import {DataBaseHelper} from "../db";
import {Song} from "../types/song";

import {post_song} from "../util/post"
import {empty_menu} from "./empty_menu"

export function application_menu (db: DataBaseHelper, song_id: number) : any {
    const song: Song = db.get_song(song_id); 
    return  JSON.stringify({
            inline_keyboard:[[
            {
                text: "accept",
                callback_data: "application_menu-accept-" + song_id
            },
            {
                text: "reject",
                callback_data: "application_menu-reject-" + song_id
            }
            ]]
        });
}


export const application_handler = {pattern: "application_menu",
    handler: function callback_handler(bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        bot.answerCallbackQuery(cbq.id);

        const user = cbq.from?.id;
        const action = cbq.data.split("-")[1];
        const song_id = parseInt(cbq.data.split("-")[2]);

        const song = db.get_song(song_id);

        const chat_id = cbq.message.chat.id;
        const msg_id = cbq.message.message_id;
        const msg_info : TelegramBot.EditMessageReplyMarkupOptions = {chat_id: chat_id, message_id: msg_id};

        console.log(action);

        if (action == "accept") {
            db.accept(song_id, "" + user)
            post_song(bot, db, song_id);
        } else if (action == "reject") {
            db.reject(song_id, "" + user);
            bot.sendMessage(song.author, song.title + " has been rejected");
        }
        bot.editMessageReplyMarkup(empty_menu(), msg_info);
    }
}