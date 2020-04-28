import {DataBaseHelper} from "./db";
import TelegramBot from 'node-telegram-bot-api';

import {myid} from "./commands/general"
import {genres, add_genre, remove_genre} from "./commands/genre"

const commands = [myid, genres, add_genre, remove_genre];

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