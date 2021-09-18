const bcrypt = require('bcryptjs');
const db = require(__dirname + '/db_connect');

(async() => {
    const sql = "INSERT INTO `admins`(`account`, `password_hash`) VALUES (?, ?)";

    const hash = await bcrypt.hash('123456', 8);

    const [result] = await db.query(sql, ['chia', hash]);
    console.log(result);
})().catch(error => {
    console.log(error);
});