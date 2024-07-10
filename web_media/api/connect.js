import mysql from 'mysql'
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    multipleStatements: true
})

db.connect(function (err) {
    if (err) {
        console.error("Error connecting: " + err.stack)
        return
    }
    console.log("Connected as id" + db.threadId)
})

setInterval(function () {
    db.query('SELECT 1');
}, 5000);

db.query("SELECT * from users", function (error, result, fields) {
    if (error) throw error
    result.forEach(result => {
        console.log(result)
    })
})