import {DataBaseHelper} from "./db";
import TelegramBot from 'node-telegram-bot-api';
import {TOKEN, CHANNEL} from "./const";
import {Song} from "./song"

const db:DataBaseHelper = new DataBaseHelper();

const bot : TelegramBot = new TelegramBot(TOKEN, {polling: true});

// GENERAL STUFF

bot.onText(/\/myid/, (msg) => {
    bot.sendMessage(msg.chat.id, `Your ID: <b> ${msg.from?.id} </b>`, {parse_mode: 'HTML'});
});

// GENRE STUFF

bot.onText(/\/genres/, (msg) => {
    const genres = db.get_genres();
    bot.sendMessage(msg.chat.id, `${genres.map(g => "#" + g + " ").join('')}`, {parse_mode: 'HTML'});
});

bot.onText(/\/add_genre/, (msg) => {
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
});

bot.onText(/\/remove_genre/, (msg) => {
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
});

// MODERATOR STUFF

bot.onText(/\/add_moderator/, (msg) => {
    const from = "" + msg.from?.id;
    if (db.is_moderator(from)) {
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
});

bot.onText(/\/remove_moderator/, (msg) => {
    const from = "" + msg.from?.id;
    if(db.is_moderator(from)) {
        const args = msg.text.match(/(\/remove_moderator)((\s)((\d+)))?/);
        if (args[4] == undefined)
            bot.sendMessage(msg.chat.id, "Argument Error");
        else {
            const mod = db.lookup_mode_name(args[4]);
            if (mod != undefined) {
                db.remove_moderator(args[4]);
                bot.sendMessage(msg.chat.id, mod.name + " is now no longer a moderator")
            } else
                bot.sendMessage(msg.chat.id, args[4] + " is not a valid moderator id")
        }
    } else 
        bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
});

bot.onText(/\/moderators/, (msg) => {
    const from = "" + msg.from?.id;
    if (db.is_moderator(from)) {
        const mods = db.get_moderators();
        bot.sendMessage(msg.chat.id, `<b>MODERATORS</b> \n\n${mods.map(m => "" + m.id + " | " + m.name + "\n").join('')}`, {parse_mode: 'HTML'});
    } else
        bot.sendMessage(msg.chat.id, "You don't have Permission to use this command!")
});

// SUBMISSION STUFF

function post_menu (song_id: number) : any {
    const song = db.get_song(song_id);
    const ratings = ['🗑️', '👎', '👌', '👍', '🔥']
    const count_scores: (score: number) => number = (score => song.scores.filter(s => s.score == score).length);  
    return  JSON.stringify({
            inline_keyboard: [
                ratings.map((r,i) => ({text:r + ' ' + count_scores(i+1),callback_data:song_id + "-score-" + i+1}))  
            ,[
            {
                text: "Play!!",
                url: song.url
            }
            ]]
        });
}

function submission_text(song_id: number) : string {
    const song:Song = db.get_song(song_id);
    return ("<b>" + song.title + "</b>" +
        "\n<b><i>Artists:</i></b>   " + song.artists.map(a => "#" + a + " ").join('') +
        "\n<b><i>Genres:</i></b>  " + song.genres.map(g => "#" + g  + " ").join('') + 
      "\n\n<b><i>Url:</i></b>         " + song.url);
}

bot.onText(/\/submit/, (msg) => {
    const song_id = 1;
    bot.sendMessage(msg.chat.id, submission_text(song_id), {parse_mode: 'HTML', reply_markup: post_menu(song_id)});
});

bot.onText(/\/my_submissions/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

// STATS

bot.onText(/\/favourites/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/top/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/feedback/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});