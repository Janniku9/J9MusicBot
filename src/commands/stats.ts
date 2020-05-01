import {DataBaseHelper} from "../db";
import TelegramBot from 'node-telegram-bot-api';


/*
    PATTERN: /myid
    PERMISSION: everyone
    DESCRIPTION: returns the id and role of the sender
*/
export  const feedback = {pattern: "/feedback", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const id = "" + msg.from?.id;
        bot.sendMessage(msg.chat.id, "Your ID: <b> " + id + " </b> \n" + 
            (db.is_owner(id) ? "You are the OWNER " : (db.is_moderator(id) ? "You are a MODERATOR":(db.is_trusted(id) ? "You are TRUSTED" : ""))), 
            {parse_mode: 'HTML'})}
};

export  const top = {pattern: "/top", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const id = "" + msg.from?.id;
        bot.sendMessage(msg.chat.id, "Your ID: <b> " + id + " </b> \n" + 
            (db.is_owner(id) ? "You are the OWNER " : (db.is_moderator(id) ? "You are a MODERATOR":(db.is_trusted(id) ? "You are TRUSTED" : ""))), 
            {parse_mode: 'HTML'})}
};

export  const favourites = {pattern: "/favourites", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const id = "" + msg.from?.id;
        bot.sendMessage(msg.chat.id, "Your ID: <b> " + id + " </b> \n" + 
            (db.is_owner(id) ? "You are the OWNER " : (db.is_moderator(id) ? "You are a MODERATOR":(db.is_trusted(id) ? "You are TRUSTED" : ""))), 
            {parse_mode: 'HTML'})}
};