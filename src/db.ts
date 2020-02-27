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

        this.db.set(list_name, list.filter(e => e != element)).write();
        return true;
    }

    // MODERATORS
    lookup_mode_name (id: string): {id:string, name:string} | undefined {
        const mods = this.get_moderators();
        return mods.find(m => m.id == id);
    }

    get_moderators () : {id: string, name: string}[] {
        return this.get_db_list('moderators');
    }

    is_moderator (moderator: string) : boolean {
        const pair = this.lookup_mode_name(moderator);
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
        const pair = this.lookup_mode_name(moderator);
        if (pair == undefined) 
            return false;
        return this.remove_from_db_list('moderators', pair, this.comp_moderator);
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
}