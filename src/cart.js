require('dotenv').config();

const express = require('express');
const db = require(__dirname + '/db_connect');
const session = require('express-session');
const app = express();






app.post('/cart/add', async(req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    const output = {
        success: false,
        error: '',
        code: 0, // 追踪程式走到哪
        cart: req.session.cart,
        postData: req.body,
    };

    const pk = req.body.pk; // primary key
    const qty = +req.body.qty;
    if (!qty || qty < 1) {
        output.error = '數量不能小於 1';
        output.code = 401;
        return res.json(output);
    }

    // 檢查是否已經有該項商品在購物車內
    const ar = req.session.cart.filter(el => el.product_id == pk);
    if (ar.length) {
        output.success = true;
        output.code = 210;
        ar[0].quantity = qty;
        return res.json(output);
    }

    const sql = "SELECT * FROM products WHERE product_id=?";
    const [rs] = await db.query(sql, [pk]);
    if (!rs.length) {
        output.error = '沒有該項商品';
        return res.json(output);
    }
    const item = rs[0];
    item.quantity = qty;

    req.session.cart.push(item);
    output.cart = req.session.cart;
    output.success = true;
    output.code = 230;

    res.json(output);
});

app.get('/cart', async(req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    res.render('cart', { cart: req.session.cart });
});

app.post('/cart/delete', async(req, res) => {
    let cart = req.session.cart;
    let pid = req.body.product_id;
    req.session.cart = cart.filter(el => el.product_id != pid);
    const output = {
        success: true,
        error: '',
        code: 0, // 追踪程式走到哪
        cart: req.session.cart,
        postData: req.body,
    };

    return res.json(output);
});


app.post('/cart/checkout', async(req, res) => {
    const output = {
        success: false,
        postData: req.body, // 丟回 client 以方便除錯
        error: '',
        code: 0,
    };
    let cart = req.session.cart;
    let user_id = req.session.user.id;

    //return res.json({ user_id, product_id: cart[0].product_id, price: cart[0].product_price, q: cart[0].quantity })

    if (!cart.length) {
        output.error = '您沒有選擇商品';
        return res.json(output);
    }
    const sql = `INSERT INTO ordertab
                 (user_id, product_id, price, quantity)
                VALUES (?,?,?,?);`;

    // 執行 SQL
    const [result1] = await db.query(sql, [user_id, cart[0].product_id, cart[0].product_price, cart[0].quantity]);

    output.result1 = result1;

    if (result1.affectedRows) {
        output.success = true;
        return res.json(output); // 回傳output結果
    }

});





module.exports = app;