import {DataBaseHelper} from "../db";
import TelegramBot from 'node-telegram-bot-api';


/*
    PATTERN: /genres
    PERMISSION: everyone
    DESCRIPTION: sends a list of all genres
*/
export  const genres = {pattern: "/genres", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const genres = db.get_genres();
        bot.sendMessage(msg.chat.id, `${genres.map(g => "#" + g + " ").join('')}`, {parse_mode: 'HTML'});
    }
};

/*
    PATTERN: /add_genre genre
    PERMISSION: moderator
    DESCRIPTION: adds a genre to the list
*/
export  const add_genre = {pattern: "/add_genre", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const from = "" + msg.from?.id;
        if (db.is_moderator(from)) {
            const args = msg.text.match(/(\/add_genre)((\s)([A-Za-z]+))?/);
            if (args[4] == undefined)
                bot.sendMessage(msg.chat.id, "Argument Error");
            else {
                const genre = args[4].toUpperCase();
                if (db.add_genre(genre)) 
                    bot.sendMessage(msg.chat.id, "#" + genre + " has been added to genres");
                else
                    bot.sendMessage(msg.chat.id, "#" + genre + " already exists");
            }
        } else 
            bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
        }
};

/*
    PATTERN: /remove_genre genre
    PERMISSION: moderator
    DESCRIPTION: removes a genre from the list
*/
export  const remove_genre = {pattern: "/remove_genre", 
    handler: function command_handler(bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const from = "" + msg.from?.id;
        if (db.is_moderator(from)) {
            const args = msg.text.match(/(\/remove_genre)((\s)([A-Za-z]+))?/);
            if (args[4] == undefined)
                bot.sendMessage(msg.chat.id, "Argument Error");
            else {
                const genre = args[4].toUpperCase();
                if (db.remove_genre(genre)) 
                    bot.sendMessage(msg.chat.id, "#" + genre + " has been removed from genres");
                else
                    bot.sendMessage(msg.chat.id, "#" + genre + " doesn't exists");
            }
        } else 
            bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
    }
};