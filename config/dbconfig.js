const mysql = require('mysql');

const pool = mysql.createPool({
    hots: 'localhost',
    user: 'root',
    password: '0000',
    database: 'mydb'
})

module.exports = pool;