const express = require('express');
const router = express.Router();
const path = require('path');

let publicDir = path.join(__dirname, '..', '..', 'public', 'login');

router.get('/', async (req, res, next) => {
    res.sendFile('index.html', {root: publicDir}, (err) => {
        if (err) console.log(err);
    });
});

router.post('/', async (req, res, next) => {
    const bcrypt = require('bcrypt');

    // connect to database
    const sqlite = require('sqlite3').verbose();
    let db = new sqlite.Database('./data/db.db', (err) => {
    if (err) console.log(err);
    });

    // promisify the db methods
    const util = require('util');
    db.run = util.promisify(db.run);
    db.get = util.promisify(db.get);
    db.all = util.promisify(db.all);

    let nickname_regex = /^([a-zA-Z0-9_]){3,16}$/.exec(req.body.nickname);
    let password_regex = /^([a-zA-Z0-9_$€!?&@|%><]){8,32}$/.exec(req.body.password);

    if (nickname_regex == null || password_regex == null) {
        res.status(400).json({
            error: true,
            message: 'Nickname or password invalid'
        });
      return;
    }

    let usersWithNickname = await db.all(`SELECT * FROM users WHERE name='${req.body.nickname}'`);

    if (usersWithNickname.length != 1) {
      res.status(400).json({
          error: true,
          message: 'Nickname or password invalid'
      });
      return;
    }

    bcrypt.compare(req.body.password, usersWithNickname[0].password, (err, result) => {
        if (err) {
            return res.status(500).json({
                error: true,
                message: 'Server-side error has occured, please try again'
            });
        }

        if (result) {
            const jwt = require('jsonwebtoken');

            const token = jwt.sign(
            {
                nickname: usersWithNickname[0].name,
                id: usersWithNickname[0].id
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            });

            res.cookie('_a', token, {maxAge: 3600000, sameSite: 'strict', secure: true});

            return res.status(200).json({
                error: false,
                message: "Sucessfully logged in",
            })
        }

        return res.status(400).json({
            error: true,
            message: 'Nickname or password invalid'
        });
    });
});

module.exports = router;