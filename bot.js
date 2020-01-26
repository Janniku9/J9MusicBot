
const consts = require('./const');
const DataBase = require('./db');

const TOKEN = consts.TOKEN;


const db = new DataBase();
db.load()

db.add_genre("ELECTRO")
db.add_moderator("Janniku9")