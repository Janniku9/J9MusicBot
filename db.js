 // imports for local json db
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

class DataBase {

    // init/format db
    load() {
        this.adapter = new FileSync('db.json');
        this.db = low(this.adapter);

        this.db.defaults({ moderators: [], genres: [], songs: [], count: 0}).write();

        // enum for song status
        this.status = {
            PENDING: "pending",
            SENT: "sent",
            DENIED: "denied"
        };
    }


    // create a new song object with initialized values
    new_song(title, artists, genres, url, poster) {
        let uid = db.get('count') + 1;
        db.update('count', n => n+1).write();
        return {uid: uid, mid: 0, status: status.PENDING, title: title, artists: artists, genres: genres, url: url, poster: poster, date: null};
    }

    add_to_array(x, name) {
        const arr = this.db.get(name).value();
       
        if (arr.indexOf(x) == -1) {
            this.db.get(name).push(x).write();
        }
    }

    add_genre(genre) {
        this.add_to_array(genre, 'genres')
    }

    add_moderator(name) {
        this.add_to_array(name, 'moderators')
    }
}

module.exports = DataBase;