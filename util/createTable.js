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


const createRivalShipTable = `
    CREATE TABLE IF NOT EXISTS rivalShipTable (
        id INT AUTO_INCREMENT PRIMARY KEY
    )
`;

connection.query(createRivalShipTable);

const createRivalShip = `
    CREATE TABLE IF NOT EXISTS rivalShips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(255) UNIQUE NOT NULL,
      length INT,
      isHorizontal BOOLEAN,
      isVisible BOOLEAN,
      oldHead VARCHAR(255),
      head VARCHAR(255),
      FOREIGN KEY (id) REFERENCES rivalShipTable(id)
    )
  `;

connection.query(createRivalShip);

const createSelfShipTable = `
    CREATE TABLE IF NOT EXISTS selfShipTable (
        id INT AUTO_INCREMENT PRIMARY KEY,
    )
`;

connection.query(createSelfShipTable);

const createSelfShip = `
    CREATE TABLE IF NOT EXISTS selfShips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(255) UNIQUE NOT NULL,
      length INT,
      isHorizontal BOOLEAN,
      isVisible BOOLEAN,
      oldHead VARCHAR(255),
      head VARCHAR(255),
      FOREIGN KEY (id) REFERENCES rivalShipTable(id)
    )
  `;

connection.query(createSelfShip);

// connection.end()

module.exports = connection;