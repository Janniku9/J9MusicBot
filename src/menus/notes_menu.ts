import TelegramBot from 'node-telegram-bot-api';
import {DataBaseHelper} from "../db";
import {Song} from "../types/song";
import {Question} from "../types/question";
import {submission_menu, submission_text} from "./submission_menu"

import {sanitize} from "../util/sanitize"

export function notes_menu (db: DataBaseHelper, song_id: number) : any {
    const song: Song = db.get_song(song_id);
    return  JSON.stringify({
            inline_keyboard: [[
                {
                    text: "waiting for new notes",
                    callback_data: "notes_menu-info-" + song_id
                }
            ],[
            {
                text: "cancel",
                callback_data: "notes_menu-cancel-" + song_id
            }
            ]]
        });
}

export const notes_question = {type: "notes", 
    handler: function (bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message, q: Question) {
        const song_id = q.options.song_id;

        const new_notes = sanitize(msg.text); 
        db.set_notes(song_id, new_notes);

        bot.deleteMessage(msg.chat.id, "" + msg.message_id)

        bot.editMessageText(submission_text(db, song_id), {chat_id: q.options.chat_id, message_id: q.options.message_id, parse_mode: 'HTML'})
        setTimeout(function() {
            bot.editMessageReplyMarkup(submission_menu(db, song_id), {chat_id: q.options.chat_id, message_id: q.options.message_id}) 
        }, (200));
    }
}

export const notes_menu_handler = {pattern: "notes_menu",
    handler: function callback_handler(bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        bot.answerCallbackQuery(cbq.id);

        const user = cbq.from?.id;
        const action = cbq.data.split("-")[1];
        const song_id = parseInt(cbq.data.split("-")[2]);

        while (action == "cancel" && db.lookup_user(user) !== undefined) {
            const q : Question = db.lookup_user(user);
            db.close_question(q.qid);
        }

        bot.editMessageReplyMarkup(submission_menu(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id})
    }
}