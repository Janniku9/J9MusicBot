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
            const mod = db.lookup_mod_name(args[4]);
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

function submission_menu (song_id: number) :any {
    const song = db.get_song(song_id);
    const t = song.title == "" ? "add title":"edit title";
    const a = song.artists == [] ? "add artist":"edit artists";
    const g = song.genres == [] ? "add genres":"edit genres";

    return  JSON.stringify({ 
        inline_keyboard: [[
            {text: t, callback_data: song_id + "-submission-menu-title"},
            {text: a, callback_data: song_id + "-submission-menu-artists"},
            {text: g, callback_data: song_id + "-submission-menu-genres"}
        ], [
            {text: "submit", callback_data: song_id + "-submission-menu-submit"},
            {text: "cancel", callback_data: song_id + "-submission-menu-cancel"}
        ]]
    });
}

function handle_submission_menu_callback(action, callback_query) {
    bot.answerCallbackQuery(callback_query.id);
    const chat_id = callback_query.message.chat.id;
    const msg_id = callback_query.message.message_id;
    const song_id = action.split("-")[0];

    if (action.includes("submit")) {
        bot.sendMessage(chat_id, "Submitted. TODO")
    } else if (action.includes("cancel")) {
        bot.sendMessage(chat_id, "cancelled. TODO")
    } else if (action.includes("title")) {
        bot.sendMessage(chat_id, "title. TODO")
    } else if (action.includes("artists")) {
        bot.sendMessage(chat_id, "artists. TODO")
    } else if (action.includes("genres")) {
        bot.editMessageReplyMarkup(genre_keyboard(song_id, 0), {chat_id: chat_id, message_id: msg_id})
    }
}

function submission_text(song_id: number) : string {
    const song:Song = db.get_song(song_id);
    return ("<b>" + song.title + "</b>" +
        "\n<b><i>Artists:</i></b>   " + song.artists.map(a => "#" + a + " ").join('') +
        "\n<b><i>Genres:</i></b>  " + song.genres.map(g => "#" + g  + " ").join('') + 
      "\n\n<b><i>Url:</i></b>         " + song.url);
}

function genre_keyboard(song_id: number, page: number) : any {
    const used_genres = db.get_song(song_id).genres;
    const genres = db.get_genres();
    const total_pages: number = Math.ceil(genres.length/12.0);
    const left_page: number = (page -1 + total_pages) % total_pages;
    const right_page: number = (page + 1) % total_pages;
    
    const left_bound = 12 * page;
    const right_bound = Math.min(12 * (page+1), genres.length);
    const p = genres.slice(left_bound, right_bound).map(g => ({text: (used_genres.find(a => a == g) == undefined ? "": "✅ ") + "#" + g, callback_data: song_id + "-" + page +"-" + g + "-genre-page-selection"}))
    return JSON.stringify({
        inline_keyboard: [
            p.slice(0,3), p.slice(3,6), p.slice(6,9), p.slice(9,12) 
        ,[
        {
            text: "<",
            callback_data: song_id + "-" + left_page + "-genre-page"
        },
        {
            text: "done!",
            callback_data: song_id + "-done-genre-page"
        },
        {
            text: ">",
            callback_data: song_id + "-" + right_page + "-genre-page"
        }
        ]]
    });
}

function handle_genre_page_selection_callback (action:string, callback_query) {
    bot.answerCallbackQuery(callback_query.id);
    const chat_id = callback_query.message.chat.id;
    const msg_id = callback_query.message.message_id;
    const song_id = parseInt(action.split("-")[0]);
    const page = parseInt(action.split("-")[1]);
    const genre = action.split("-")[2];

    if (db.get_song(song_id).genres.find(g => g == genre)) {
        db.remove_genre_from_song(song_id, genre);
    } else {
        db.add_genre_to_song(song_id, genre);
    }

    bot.editMessageText(submission_text(song_id), {chat_id: chat_id, message_id: msg_id, parse_mode: 'HTML'})
    setTimeout(function() {
        bot.editMessageReplyMarkup(genre_keyboard(song_id, page), {chat_id: chat_id, message_id: msg_id})
    }, (200));
}

function handle_genre_page_switch_callback (action:string, callback_query) {
    bot.answerCallbackQuery(callback_query.id);
    const chat_id = callback_query.message.chat.id;
    const msg_id = callback_query.message.message_id;

    if (action.includes('done-genre-page')) {
        const song_id = parseInt(action.split('-')[0]);
        bot.editMessageReplyMarkup(submission_menu(song_id), {chat_id: chat_id, message_id: msg_id})
    } else {
        const song_id = parseInt(action.split('-')[0]);
        const page = parseInt(action.split('-')[1]);
        bot.editMessageReplyMarkup(genre_keyboard(song_id, page), {chat_id: chat_id, message_id: msg_id})
    }
}

bot.onText(/\/submit/, (msg) => {
    const song_id = 1;
    bot.sendMessage(msg.chat.id, submission_text(song_id), {parse_mode: 'HTML', reply_markup: submission_menu(song_id)});
});

bot.onText(/\/my_submissions/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

// POSTING

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

function handle_score_callback (action: string, callback_query) {

}

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

// CALLBACKS

bot.on('callback_query', function onCallbackQuery(callback_query) {
    const action = callback_query.data;

    if (action.includes('-genre-page-selection'))
        handle_genre_page_selection_callback(action, callback_query);
    else if (action.includes('-genre-page'))
        handle_genre_page_switch_callback(action, callback_query);
    else if (action.includes('-score'))
        handle_score_callback(action, callback_query);
    else if (action.includes('-submission-menu'))
        handle_submission_menu_callback(action, callback_query);
  });

// ERROR

bot.on('polling_error', error => console.log(error))