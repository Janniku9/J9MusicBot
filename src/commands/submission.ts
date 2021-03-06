import {DataBaseHelper} from "../db";
import TelegramBot from 'node-telegram-bot-api';

import {submission_menu, submission_text} from '../menus/submission_menu'

/*
    PATTERN: /submit url
    PERMISSION: everyone
    DESCRIPTION: makes a new submission
*/
export  const submit = {pattern: "/submit", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const url = msg.text.match(/(\/submit\s)(https:\/\/www\.youtube\.com\/watch\?v=[\S]*)/)[2];

        if (url === undefined) {
            bot.sendMessage(msg.chat.id, "Invalid Url");
            return;
        }

        const song_id = db.create_song(url, msg.from?.id);
        
        if (song_id == -1)
            bot.sendMessage(msg.chat.id, "this song already has been submitted");
        else
            bot.sendMessage(msg.chat.id, submission_text(db, song_id), {parse_mode: 'HTML', reply_markup: submission_menu(db, song_id)})
    }
};

/*
    PATTERN: /submissions
    PERMISSION: everyone
    DESCRIPTION: sends a list of their own submissions
*/
export  const submissions = {pattern: "/submissions", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
    }
};