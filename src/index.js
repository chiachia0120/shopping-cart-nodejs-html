require('dotenv').config();

const express = require('express');
const app = express();
const db = require(__dirname + '/db_connect');
const session = require('express-session');
const bcrypt = require('bcryptjs');

app.set('view engine', 'ejs'); // 設定樣版引擎
app.use(express.urlencoded({ extended: false })); // 使用 urlencoded
app.use(express.json()); // 使用 json
app.use(express.static('public')); // 使用public資料夾下的靜態資源


app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'ksdfhkjdfsdigdogipog495734905',
    cookie: {
        maxAge: 1200000
    }
}));

app.use((req, res, next) => {
    res.locals.title = 'TABEMONO';
    res.locals.session = req.session;

    next();
});

app.use(require(__dirname + '/cart'));







app.get('/', async(req, res) => {
    const sql = "SELECT * FROM products";
    const [rs] = await db.query(sql);
    res.render('index', { rs });
});
app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/product', async(req, res) => {
    const sql = "SELECT * FROM products";
    const [rs] = await db.query(sql);

    res.render('product', { rs });
});


app.get('/password', (req, res) => {
    res.render('password');
});


app.get('/termsofuse', (req, res) => {
    res.render('termsofuse');
});
app.get('/privacy', (req, res) => {
    res.render('privacy');
});


app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', async(req, res) => {
    const output = {
        success: false,
        error: '',
        userData: null,
    };
    if (!req.body.account || !req.body.password) {
        output.error = '欄位資料不足';
        return res.json(output);
    }

    const sql = "SELECT * FROM admins WHERE account=?";
    const [rs] = await db.query(sql, [req.body.account]);
    if (!rs.length) {
        output.error = '帳號錯誤';
        return res.json(output);
    }

    const result = await bcrypt.compare(req.body.password, rs[0].password_hash);
    if (result) {
        req.session.admin = {
            account: rs[0].account,
            id: rs[0].id
        };
        output.success = true;
        output.userData = rs;
    } else {
        output.error = '密碼錯誤';
    }

    res.json(output);


});

app.get('/logout', (req, res) => {
    delete req.session.admin;
    res.redirect('/');
});


app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', async(req, res) => {
    const output = {
        success: false,
        postData: req.body, // 丟回 client 以方便除錯
        error: '',
        code: 0,
    };
    let { name, account, mobile, password, password2 } = req.body;

    if (name.length < 2) {
        output.error = '姓名字串長度要超過兩個字';
        return res.json(output);
    }

    if (password != password2) {
        output.error = '密碼輸入不同';
        return res.json(output);
    }


    const sql = `INSERT INTO users
                (name,
                account,
                mobile,
                password)
                VALUES (?,?,?,?);`;

    // 執行 SQL
    const [result] = await db.query(sql, [name, account, mobile, password]);

    output.result = result;

    if (result.affectedRows) {
        output.success = true;
        return res.json(output); // 回傳output結果
    }

});
// start here

// end here


// 放在所有路由的後面
app.use((req, res) => {
    res.type('text/html');
    res.status = 404;
    res.send(`
    path: ${req.url} <br>
    <h2>404 - page not found</h2>
    `);
});
// 設定 port
app.listen(3001, () => {
    console.log('process.argv:', process.argv);
    console.log('server started!');
});