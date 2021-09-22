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
        output.error = '欄位資料不足1';
        return res.json(output);
    }

    const sql1 = "SELECT * FROM users WHERE account=?";
    const [rs1] = await db.query(sql1, [req.body.account]);
    if (!rs1.length) {
        output.error = '帳號錯誤1';
        return res.json(output);
    }


    if (req.body.password == rs1[0].password) {
        req.session.user = {
            account: rs1[0].account,
            id: rs1[0].user_id
        };
        output.success = true;
        output.userData = rs1;
    } else {
        output.error = '密碼錯誤1';
    }

    res.json(output);

});



app.get('/logout', (req, res) => {
    delete req.session.user;
    res.redirect('/');
});

app.get('/delete', (req, res) => {
    res.render('delete');
});

app.post('/delete', async(req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0, // 追踪程式走到哪
        postData: req.body,
    };

    const sql2 = "DELETE FROM `ordertab` WHERE `account`=?";

    const [result] = await db.query(sql2, [account]);

    // output.result = result;
    // if (result.affectedRows) {
    //     if (result.changedRows) {
    //         output.success = true;
    //     } else {
    //         output.error = '資料沒有刪除';
    //     }
    // }
});


app.post('/forgetpassword', async(req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0, // 追踪程式走到哪
        postData: req.body,
    };

    const sql4 = "SELECT * FROM users WHERE account=?";

    const account = req.body.account;
    const password = req.body.password;
    const password2 = req.body.password2;


    const [rs] = await db.query(sql4, [account]);
    if (!rs) {
        output.error = '查無帳號';
        return res.json(output);
    }

    if (password != password2) {
        output.error = '密碼錯誤';
        return res.json(output);
    }

    const sql5 = `UPDATE \`users\` SET \`password\`=?  WHERE account=?`;

    const [result] = await db.query(sql5, [password, account]);

    output.result = result;
    if (result.affectedRows) {
        if (result.changedRows) {
            output.success = true;
        } else {
            output.error = '資料沒有變更';
        }
    }

    res.json(output);
});

app.get('/checkout', (req, res) => {
    res.render('checkout');
});


app.get('/forgetpassword', (req, res) => {
    res.render('forgetpassword');
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