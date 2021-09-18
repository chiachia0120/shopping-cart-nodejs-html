// 灰色 #6c757d





const mysql = require('mysql2');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'High2626',
    database: 'shop01',
});

connection.query('SELECT * FROM products LIMIT 4',
    (error, results, fields) => {
        if (error) {
            console.log('錯誤:', error);
        } else {
            console.log(results);
            console.log(fields);
        }
    });