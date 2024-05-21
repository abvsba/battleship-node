const mysql= require('mysql2');

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.BD_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect((error) => {
    if (error) {
        throw error;
    }
    console.log('Connected to database');
})

module.exports = connection;