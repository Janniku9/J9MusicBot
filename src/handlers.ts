import {DataBaseHelper} from "./db";
import TelegramBot from 'node-telegram-bot-api';

import {Question} from "./types/question"

import {myid} from "./commands/general"
import {genres, add_genre, remove_genre} from "./commands/genre"
import {submit} from "./commands/submission"
import {moderators, add_moderator, remove_moderator, trusted, add_trusted, remove_trusted} from "./commands/permission"

const commands = [myid, genres, add_genre, remove_genre, submit, moderators, add_moderator, remove_moderator, trusted, add_trusted, remove_trusted];

export class CommandHandler {
    private command_resolver: {[pattern: string] : (bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) => void} = {};

    constructor(){
        this.create_command_resolver();
    }

    private create_command_resolver() {
        
        commands.forEach(c => {
            this.command_resolver[c.pattern] = c.handler
        });
    }

    public resolve_command (bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const text = msg.text.split(' ')[0];
        if (this.command_resolver[text] !== undefined) 
            this.command_resolver[text](bot, db, msg);
        
    }
}

import {submission_menu_handler} from "./menus/submission_menu"
import {genre_menu_switch_handler, genre_menu_selection_handler} from "./menus/genre_menu"
import {title_menu_handler} from "./menus/title_menu"
import {artist_add_menu_handler, artist_menu_handler, artist_remove_menu_handler} from "./menus/artist_menu"

const callbacks = [submission_menu_handler, genre_menu_switch_handler, genre_menu_selection_handler, title_menu_handler, artist_add_menu_handler, artist_menu_handler, artist_remove_menu_handler]

export class CallbackHandler {
    private callback_resolver: {[pattern: string] : (bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) => void} = {};

    constructor(){
        this.create_callback_resolver();
    }

    private create_callback_resolver() {
        
        callbacks.forEach(c => {
            this.callback_resolver[c.pattern] = c.handler
        });
    }

    public resolve_callback (bot: TelegramBot, db: DataBaseHelper, cbq: TelegramBot.CallbackQuery) {
        const action = cbq.data.split("-")[0];

        if (this.callback_resolver[action] !== undefined) 
            this.callback_resolver[action](bot, db, cbq);
    }
}

import {title_question} from "./menus/title_menu"
import {artist_question} from "./menus/artist_menu"

const questions = [title_question, artist_question]

export class QuestionHandler {
    private question_resolver: {[type: string] : (bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message, q: Question) => void} = {};

    constructor(){
        this.create_question_resolver();
    }

    private create_question_resolver() {
        
        questions.forEach(q => {
            this.question_resolver[q.type] = q.handler
        });
    }

    public resolve_question (bot: TelegramBot, db: DataBaseHelper, msg: TelegramBot.Message) {
        const user = msg.from?.id;
        if (db.lookup_user(user) !== undefined) {
            const q = db.lookup_user(user);
            db.close_question(q.qid);
            this.question_resolver[q.type](bot, db, msg, q);
        }
    }
}