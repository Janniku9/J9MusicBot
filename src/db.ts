 // imports for local json db
import lowdb from "lowdb";
import { default as FileSync } from "lowdb/adapters/FileSync";
import {Song, Status, default_song} from "./song" 

export class DataBaseHelper {
    private db: lowdb.LowdbSync<any>;

    constructor(){
        this.initDatabase();
    }

    // DB INIT

    private initDatabase() {
        const adapter = new FileSync('db.json');
        this.db = lowdb(adapter);
        this.db.defaults({moderators: [], songs: [], genres:[], uid: 0}).write();
    }

    private get_uid() : number {
         const new_uid : number = this.db.get('uid').value() + 1;
         this.db.set('uid', new_uid).write();
         return new_uid;
    }

    // SONG STUFF

    create_song(url): boolean {
        if (this.db.get('songs').value().find(s => url == s.url)) 
            return false;

        const song: Song = {...default_song, url: url, uid: this.get_uid(), creation_date: new Date(), };

        this.db.update('songs',s => {s.push(song); return s}).write();
        
        return true;
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

    // MANAGE LISTS
    private get_db_list (list_name: string): string[] {
        const list: string[] = this.db.get(list_name).value();
        return list;
    }

    private is_in_db_list (list_name: string, element: string) : boolean {
        let list = this.get_db_list(list_name);

        if (list.find(e => e == element) == undefined)
            return false;
        return true
    }

    private add_to_db_list(list_name: string, element: string) : boolean {
        let list = this.get_db_list(list_name);

        if (this.is_in_db_list(list_name, element))
            return false;

        list.push(element);

        this.db.set(list_name, list).write();
        return true
    }

    private remove_from_db_list(list_name: string, element: string) : boolean {
        let list = this.get_db_list(list_name);

        if (!this.is_in_db_list(list_name, element))
            return false;

        this.db.set(list_name, list.filter(e => e != element)).write();
        return true;
    }

    // MODERATORS
    get_moderators () : string[] {
        return this.get_db_list('moderators');
    }

    is_moderator (moderator: string) : boolean {
        return this.is_in_db_list('moderators', moderator)
    }

    add_moderator (moderator: string) : boolean {
        return this.add_to_db_list('moderators', moderator);
    }

    remove_moderator (moderator: string) : boolean {
        return this.remove_from_db_list('moderators', moderator);
    }

    // GENRES
    get_genres () : string[] {
        return this.get_db_list('genres').sort((a,b) => a > b ? 1 : b > a ? -1 : 0);
    }

    is_genre (genre: string) : boolean {
        return this.is_in_db_list('genres', genre)
    }

    add_genre (genre: string) : boolean {
        return this.add_to_db_list('genres', genre);
    }

    remove_genre (genre: string) : boolean {
        return this.remove_from_db_list('genres', genre);
    }
}