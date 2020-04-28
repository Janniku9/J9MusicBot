import TelegramBot from 'node-telegram-bot-api';
import {DataBaseHelper} from "../db";
import {Song} from "../types/song";

export function post_menu (db: DataBaseHelper, song_id: number) : any {
    const song: Song = db.get_song(song_id);
    const ratings = ['🗑️', '👎', '👌', '👍', '🔥']
    const count_scores: (score: number) => number = (score => song.scores.filter(s => s.score == score).length);  
    return  JSON.stringify({
            inline_keyboard: [
                ratings.map((r,i) => ({text:r + ' ' + count_scores(i+1), callback_data:"score-" + song_id + "-" + (i+1)}))  
            ,[
            {
                text: "Play!!",
                url: song.url
            }
            ]]
        });
}


export const score_handler = {pattern: "score",
    handler: function callback_handler(bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        bot.answerCallbackQuery(cbq.id);

        const user = cbq.from?.id;
        const song_id = parseInt(cbq.data.split("-")[1]);
        const score = parseInt(cbq.data.split("-")[2]);

        db.set_rating(song_id, user, score);

        setTimeout(function() {
            bot.editMessageReplyMarkup(post_menu(db, song_id), {chat_id: cbq.message.chat.id, message_id: cbq.message.message_id}) 
        }, (200));
    }
}