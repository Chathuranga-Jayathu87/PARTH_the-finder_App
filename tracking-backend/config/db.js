

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});

pool.getConnection()
    .then(connection => {
        console.log("Connect to MYSQL DataBase Succsessfully!!");
        connection.release();
    })
    .catch(err =>{
        console.log("Error Connecting to MYSQL: ",err.message);
    });

    module.exports = pool;