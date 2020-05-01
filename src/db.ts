 // imports for local json db
import lowdb from "lowdb";
import { default as FileSync } from "lowdb/adapters/FileSync";
import {Song, Status, default_song} from "./types/song" 
import {Question} from "./types/question" 

export class DataBaseHelper {
    private db;

    constructor(){
        this.initDatabase();
    }

    // DB INIT

    private initDatabase() {
        const adapter = new FileSync('db.json');
        this.db = lowdb(adapter);
        this.db.defaults({owner: {}, moderators: [], trusted: [], songs: [], genres:[], questions:[], uid: 0}).write();
    }

    private get_uid() : number {
         const new_uid : number = this.db.get('uid').value() + 1;
         this.db.set('uid', new_uid).write();
         return new_uid;
    }

    // SONG STUFF

    create_song(url, author): number {
        if (this.db.get('songs').value().find(s => url == s.url && s.status == Status.APPROVED)) 
            return -1;

        const song: Song = {...default_song, url: url, author: author, uid: this.get_uid(), creation_date: new Date(), };

        this.db.update('songs',s => {s.push(song); return s}).write();
        
        return song.uid;
    }

    private get_songs (): Song[] {
        return this.db.get('songs').value();
    }

    get_song(uid: number) : Song | undefined{
        return this.get_songs().find(song => song.uid == uid);
    }

    get_songs_with(fun: (s: Song) => boolean) : Song[] {
        return this.get_songs().filter(fun);
    }

    remove_genre_from_song(song_id: number, genre: string) {
        const new_genres = this.get_song(song_id).genres.filter(g => g != genre);
        this.db.get('songs').find({uid: song_id}).assign({genres: new_genres}).write();
    }

    add_genre_to_song(song_id: number, genre: string) {
        let new_genres = this.get_song(song_id).genres;
        new_genres.push(genre);
        this.db.get('songs').find({uid: song_id}).assign({genres: new_genres}).write();
    }

    set_title(song_id: number, new_title: string) {
        this.db.get('songs').find({uid: song_id}).assign({title: new_title}).write();
    }

    set_notes(song_id: number, new_notes: string) {
        this.db.get('songs').find({uid: song_id}).assign({notes: new_notes}).write();
    }

    remove_artist_from_song(song_id: number, artist: string) {
        const new_artists = this.get_song(song_id).artists.filter(a => a != artist);
        this.db.get('songs').find({uid: song_id}).assign({artists: new_artists}).write();
    }

    add_artist_to_song(song_id: number, artist: string) {
        let new_artists = this.get_song(song_id).artists;
        new_artists.push(artist);
        this.db.get('songs').find({uid: song_id}).assign({artists: new_artists}).write();
    }

    set_rating(song_id: number, user: number, score: number) {
        let scores = this.get_song(song_id).scores.filter(s => s.user != "" + user);
        scores.push({user: "" + user, score: score});
        this.db.get('songs').find({uid: song_id}).assign({scores: scores}).write();
    }

    post_song(song_id: number, message_id: number, chat_id: number) {
        this.db.get('songs').find({uid: song_id}).assign({status: Status.APPROVED, message_id: message_id, chat_id: chat_id}).write();
    }

    reject(song_id: number, mod: string) {
        this.db.get('songs').find({uid: song_id}).assign({status: Status.DENIED, moderator: mod}).write();
    }

    accept(song_id: number, mod: string) {
        this.db.get('songs').find({uid: song_id}).assign({moderator: mod}).write();
    }

    // MANAGE LISTS
    private get_db_list (list_name: string): any[] {
        const list: string[] = this.db.get(list_name).value();
        return list;
    }

    private is_in_db_list (list_name: string, element: any, comp: (a: any, b:any) => boolean) : boolean {
        let list = this.get_db_list(list_name);

        if (list.find(e => comp(e, element)) == undefined)
            return false;
        return true
    }

    private add_to_db_list(list_name: string, element: any, comp: (a: any, b:any) => boolean) : boolean {
        let list = this.get_db_list(list_name);

        if (this.is_in_db_list(list_name, element, comp))
            return false;

        list.push(element);

        this.db.set(list_name, list).write();
        return true
    }

    private remove_from_db_list(list_name: string, element: any, comp: (a: any, b:any) => boolean) : boolean {
        let list = this.get_db_list(list_name);

        if (!this.is_in_db_list(list_name, element, comp))
            return false;

        this.db.set(list_name, list.filter(e => !comp(e, element))).write();
        return true;
    }

    // MODERATORS
    get_owner() : {id:string, name:string} {
        return this.db.get('owner').value();
    }

    is_owner(owner: string) : boolean {
        return owner == this.get_owner().id;
    } 

    lookup_mod_name (id: string): {id:string, name:string} | undefined {
        const mods = this.get_moderators();
        return mods.find(m => m.id == id);
    }

    get_moderators () : {id: string, name: string}[] {
        return this.get_db_list('moderators');
    }

    is_moderator (moderator: string) : boolean {
        if (moderator == this.get_owner().id)
            return true;

        const pair = this.lookup_mod_name(moderator);
        if (pair == undefined) 
            return false;
        return true;
    }

    comp_moderator (m1: {id: string, name:string}, m2: {id:string, name:string}) : boolean {
        return m1.id == m2.id;
    }

    add_moderator (moderator: {id: string, name: string}) : boolean {
        return this.add_to_db_list('moderators', moderator, this.comp_moderator);
    }

    remove_moderator (moderator: string) : boolean {
        const pair = this.lookup_mod_name(moderator);
        if (pair == undefined) 
            return false;
        return this.remove_from_db_list('moderators', pair, this.comp_moderator);
    }

    lookup_trustedname (id: string): {id:string, name:string} | undefined {
        const trusted = this.get_trusted();
        return trusted.find(t => t.id == id);
    }

    get_trusted () : {id: string, name: string}[] {
        return this.get_db_list('trusted');
    }

    is_trusted (trusted: string) : boolean {
        if (trusted == this.get_owner().id || this.is_moderator(trusted))
            return true;

        const pair = this.lookup_trustedname(trusted);
        if (pair == undefined) 
            return false;
        return true;
    }

    comp_trusted (t1: {id: string, name:string}, t2: {id:string, name:string}) : boolean {
        return t1.id == t2.id;
    }

    add_trusted (t: {id: string, name: string}) : boolean {
        return this.add_to_db_list('trusted', t, this.comp_trusted);
    }

    remove_trusted (t: string) : boolean {
        const pair = this.lookup_trustedname(t);
        if (pair == undefined) 
            return false;
        return this.remove_from_db_list('trusted', pair, this.comp_trusted);
    }

    // GENRES
    get_genres () : string[] {
        return this.get_db_list('genres').sort((a,b) => a > b ? 1 : b > a ? -1 : 0);
    }

    comp_genre (g1: string, g2: string) {
        return g1 == g2;
    }

    is_genre (genre: string) : boolean {
        return this.is_in_db_list('genres', genre, this.comp_genre)
    }

    add_genre (genre: string) : boolean {
        return this.add_to_db_list('genres', genre, this.comp_genre);
    }

    remove_genre (genre: string) : boolean {
        return this.remove_from_db_list('genres', genre, this.comp_genre);
    }

    // QUESTIONS
    get_open_questions() {
        return this.get_db_list('questions');
    }

    comp_question (q1: Question, q2: Question) {
        return q1.qid == q2.qid;
    }

    lookup_qid(qid: number) {
        const questions = this.get_open_questions();
        return questions.find(q => q.qid == qid);
    }

    lookup_user(user: number) {
        const questions = this.get_open_questions();
        return questions.find(q => q.user == user);
    }

    get_mex_qid() {
        const questions = this.get_open_questions().sort((a,b) => a.qid - b.qid);
        return questions.reduce((qid, q) => qid + (qid == q.qid ? 1 : 0), 0);
    }

    add_question(user: number, type: string, options: {}) {
        const question = {qid: this.get_mex_qid(), user: user, type: type, options: options};
        this.add_to_db_list('questions', question, this.comp_question)
    }

    close_question(qid: number) {
        const question : Question = {qid: qid, user: 0, type: "", options: {}};
        return this.remove_from_db_list('questions', question, this.comp_question);
    }

    open_new_question(user: number, type: string, options: {}) {
        while (this.lookup_user(user) !== undefined) {
            const q = this.lookup_user(user);
            this.close_question(q.qid);
        } 
        this.add_question(user, type, options);
    }
}