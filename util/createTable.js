const connection = require('./connectionDB');

const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;
connection.query(createUserTable, (err) => {
    if (err) {
        console.error('Error in create users table:', err);
        return;
    }
    console.log('Table users created...');
});

//======================================================

const createGames = `
    CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        fireDirection INT,
        totalHits INT NOT NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`;
connection.query(createGames);

//=====================================================

const createHistoryTable = `
    CREATE TABLE IF NOT EXISTS game_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        totalHits INT NOT NULL,
        timeConsumed INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        result VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`;

connection.query(createHistoryTable);

//=====================================================

const createPreviousShotsTable = `
    CREATE TABLE IF NOT EXISTS previous_shots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        row INT,
        col INT,
        game_id INT,
        FOREIGN KEY (game_id) REFERENCES games(id)
    )
`;
connection.query(createPreviousShotsTable);

//======================================================

const createSelfShips = `
     CREATE TABLE IF NOT EXISTS self_ships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        length INT,
        isHorizontal BOOLEAN,
        isVisible BOOLEAN,
        hit INT,
        head VARCHAR(255) NOT NULL,
        game_id INT,
        FOREIGN KEY (game_id) REFERENCES games(id)
    )
`;
connection.query(createSelfShips);

//======================================================

const createRivalShips = `
    CREATE TABLE IF NOT EXISTS rival_Ships (
       id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        length INT,
        isHorizontal BOOLEAN,
        isVisible BOOLEAN,
        hit INT,
        head VARCHAR(255) NOT NULL,
        game_id INT,
        FOREIGN KEY (game_id) REFERENCES games(id)
    )
  `;
connection.query(createRivalShips);

//======================================================


const createSelfBoard = `
     CREATE TABLE IF NOT EXISTS self_board (
        id INT AUTO_INCREMENT PRIMARY KEY,
        row INT,
        col INT,
        hit VARCHAR(255),
        game_id INT,
        FOREIGN KEY (game_id) REFERENCES games(id)
    )
`;
connection.query(createSelfBoard);

//======================================================

const createRivalBoard = `
     CREATE TABLE IF NOT EXISTS rival_board (
        id INT AUTO_INCREMENT PRIMARY KEY,
        row INT,
        col INT,
        hit VARCHAR(255),
        game_id INT,
        FOREIGN KEY (game_id) REFERENCES games(id)
    )
`;
connection.query(createRivalBoard);

module.exports = connection;