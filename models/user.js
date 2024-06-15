const db = require('../util/connectionDB');

module.exports = class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    static async findByUsername(username) {
        return db.promise().query(
            'SELECT * FROM users WHERE username = ?', [username]
        );
    }

    static async findByEmail(email) {
        return db.promise().query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
    }

    static async findByUserId(userId) {
        return db.promise().query(
            'SELECT * FROM users WHERE id = ?', [userId]
        );
    }

    static async save(user) {
        return db.promise().execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [user.username, user.email, user.password]
        );
    }

    static async deleteUser(userId) {
        return db.promise().execute('DELETE FROM users WHERE id = ?', [userId]);
    }

    static async updatePassword(password, userId) {
        return db.promise().execute('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
    }


    static async saveGameDetails(gameDetails, user_id, date) {
        let punctuation = gameDetails.totalHits/ gameDetails.timeConsumed;
        return db.promise().execute(
            'INSERT INTO game_history (totalHits, timeConsumed, username, result, date, punctuation, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [gameDetails.totalHits, gameDetails.timeConsumed, gameDetails.username, gameDetails.result, date, punctuation, user_id]
        );
    }

    static async findGameDetailsByUserId(userId) {
        return db.promise().query(
            'SELECT * FROM game_history WHERE user_id = ? LIMIT 10', [userId]
        );
    }

    static async retrieveRanking() {
        return db.promise().query(
            'SELECT * FROM game_history WHERE result = ? ORDER BY totalHits ASC, timeConsumed ASC LIMIT 15', 'win'
        );
    }

    static async deleteUserFromTable() {
        return db.promise().execute('DELETE FROM battleship_test.users');
    }

}