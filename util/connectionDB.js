const mysql= require('mysql2');

const { DB_HOST, BD_USER, DB_PASSWORD, DB_NAME, DB_NAME_TEST, NODE_ENV } = process.env;

const connection = mysql.createConnection({
    host: DB_HOST,
    user: BD_USER,
    password: DB_PASSWORD,
    database: NODE_ENV === 'test' ? DB_NAME_TEST : DB_NAME,
});

connection.connect((error) => {
    if (error) {
        throw error;
    }
    console.log('Connected to database ' + NODE_ENV);
})

module.exports = connection;