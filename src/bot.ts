import {DataBaseHelper} from "./db";
import TelegramBot from 'node-telegram-bot-api';
import {TOKEN, CHANNEL} from "./const";
import {Song} from "./types/song"
import {CommandHandler, CallbackHandler} from "./handlers"

const db:DataBaseHelper = new DataBaseHelper();

const bot: TelegramBot = new TelegramBot(TOKEN, {polling: true});

const ch: CommandHandler = new CommandHandler();

const cbh: CallbackHandler = new CallbackHandler(); 


// COMMAND HANDLER
bot.on('text', (msg) => {
    ch.resolve_command(bot, db, msg);
});


// INLINE QUERYS

bot.on('inline_query', ctx => {
    const query = ctx.query;
    const user = ctx.from.id;

    const no_res = [{id:'no_res', type: 'article' as 'article', title:"not a valid bo result found", input_message_content: {message_text: "no result found for " + query}}]

    bot.answerInlineQuery(ctx.id, no_res)
})

// CALLBACKS

bot.on('callback_query', function onCallbackQuery(cbq) {
    cbh.resolve_callback(bot, db, cbq);
});

// ERROR

bot.on('polling_error', error => console.log(error))