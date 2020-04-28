export type Question = {
    qid: number,
    user: number, 
    type: string, 
    options: {song_id?: number, message_id?: number, chat_id?: number}
}