import {DataBaseHelper} from "../db";
import {Song} from "../types/song";

export function post_menu (db: DataBaseHelper, song_id: number) : any {
    const song: Song = db.get_song(song_id);
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