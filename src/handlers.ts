import {DataBaseHelper} from "./db";
import TelegramBot from 'node-telegram-bot-api';

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

const callbacks = [submission_menu_handler, genre_menu_switch_handler, genre_menu_selection_handler]

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