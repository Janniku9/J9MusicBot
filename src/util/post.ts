import TelegramBot from 'node-telegram-bot-api';
import {DataBaseHelper} from "../db";
import {Song} from "../types/song";

import {submission_text} from "../menus/submission_menu"
import {post_menu} from "../menus/post_menu"

import {CHANNEL} from "../const"

export function post_song(bot: TelegramBot, db: DataBaseHelper, song_id: number) {
    bot.sendMessage(CHANNEL, submission_text(db, song_id), {parse_mode: 'HTML', reply_markup: post_menu(db, song_id)}).then(msg => {
        const message_id = msg.message_id;
        const chat_id = msg.chat.id;
        db.post_song(song_id, message_id, chat_id);
    });
}