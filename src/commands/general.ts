import {DataBaseHelper} from "../db";
import TelegramBot from 'node-telegram-bot-api';

import {CHANNEL} from "../const"


/*
    PATTERN: /myid
    PERMISSION: everyone
    DESCRIPTION: returns the id and role of the sender
*/
export  const myid = {pattern: "/myid", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const id = "" + msg.from?.id;
        bot.sendMessage(msg.chat.id, "Your ID: <b> " + id + " </b> \n" + 
            (db.is_owner(id) ? "You are the OWNER " : (db.is_moderator(id) ? "You are a MODERATOR":(db.is_trusted(id) ? "You are TRUSTED" : ""))), 
            {parse_mode: 'HTML'})}
};

/*
    PATTERN: /channel
    PERMISSION: everyone
    DESCRIPTION: returns the channel invite link
*/
export  const channel = {pattern: "/channel", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const id = "" + msg.from?.id;
        bot.sendMessage(msg.chat.id, "<b>Join now!</b> \n https://t.me/" + CHANNEL.replace("@", ""))}
};


