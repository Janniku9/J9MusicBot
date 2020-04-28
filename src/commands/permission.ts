import {DataBaseHelper} from "../db";
import TelegramBot from 'node-telegram-bot-api';

/*
    PATTERN: /moderators
    PERMISSION: moderator
    DESCRIPTION: sends a list of all moderators
*/
export  const moderators = {pattern: "/moderators", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const from = "" + msg.from?.id;
        if (db.is_moderator(from)) {
            const mods = db.get_moderators();
            bot.sendMessage(msg.chat.id, `<b>MODERATORS</b> \n\n${mods.map(m => "" + m.id + " | " + m.name + "\n").join('')}`, {parse_mode: 'HTML'});
        } else
            bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
    }
};

/*
    PATTERN: /add_moderator id name
    PERMISSION: owner
    DESCRIPTION: promotes the user {id, name} to moderator
*/
export  const add_moderator = {pattern: "/add_moderator", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const from = "" + msg.from?.id;
        if (db.is_owner(from)) {
            const args = msg.text.match(/(\/add_moderator)((\s)((\d+)(\s)([^\s]+)))?/); 
            // 4 is pair, 5 is id and 7 is name
            if (args[4] == undefined)
                bot.sendMessage(msg.chat.id, "Argument Error");
            else {
                if (db.add_moderator({id: args[5], name: args[7]}))
                    bot.sendMessage(msg.chat.id, args[7] + " has been promoted to moderator");
                else
                    bot.sendMessage(msg.chat.id, args[7] + " already is a moderator");
            }
        } else 
            bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
        }
};

/*
    PATTERN: /reemove_moderator id
    PERMISSION: owner
    DESCRIPTION: removes the moderator id from the list of moderators
*/
export  const remove_moderator = {pattern: "/remove_moderator", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const from = "" + msg.from?.id;
        if(db.is_owner(from)) {
            const args = msg.text.match(/(\/remove_moderator)((\s)((\d+)))?/);
            if (args[4] == undefined)
                bot.sendMessage(msg.chat.id, "Argument Error");
            else {
                const mod = db.lookup_mod_name(args[4]);
                if (mod != undefined) {
                    db.remove_moderator(args[4]);
                    bot.sendMessage(msg.chat.id, mod.name + " is now no longer a moderator")
                } else
                    bot.sendMessage(msg.chat.id, args[4] + " is not a valid moderator id")
            }
        } else 
            bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
        }
};

export  const trusted = {pattern: "/trusted", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const from = "" + msg.from?.id;
        if (db.is_moderator(from)) {
            const t = db.get_trusted();
            bot.sendMessage(msg.chat.id, `<b>TRUSTED</b> \n\n${t.map(m => "" + m.id + " | " + m.name + "\n").join('')}`, {parse_mode: 'HTML'});
        } else
            bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
        }
};

export  const add_trusted = {pattern: "/add_trusted", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const from = "" + msg.from?.id;
        if (db.is_moderator(from)) {
            const args = msg.text.match(/(\/add_trusted)((\s)((\d+)(\s)([^\s]+)))?/); 
            // 4 is pair, 5 is id and 7 is name
            if (args[4] == undefined)
                bot.sendMessage(msg.chat.id, "Argument Error");
            else {
                if (db.add_trusted({id: args[5], name: args[7]}))
                    bot.sendMessage(msg.chat.id, args[7] + " has been promoted to trusted");
                else
                    bot.sendMessage(msg.chat.id, args[7] + " already is trusted");
            }
        } else 
            bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
    }
};

export  const remove_trusted = {pattern: "/remove_trusted", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const from = "" + msg.from?.id;
        if(db.is_moderator(from)) {
            const args = msg.text.match(/(\/remove_trusted)((\s)((\d+)))?/);
            if (args[4] == undefined)
                bot.sendMessage(msg.chat.id, "Argument Error");
            else {
                const t = db.lookup_trustedname(args[4]);
                if (t != undefined) {
                    db.remove_trusted(args[4]);
                    bot.sendMessage(msg.chat.id, t.name + " is now no longer trusted")
                } else
                    bot.sendMessage(msg.chat.id, args[4] + " is not a valid trusted id")
            }
        } else 
            bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
    }
};