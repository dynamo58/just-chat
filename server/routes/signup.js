const express = require('express');
const router = express.Router();
const path = require('path');



let publicDir = path.join(__dirname, '..', '..', 'public', 'signup');

router.get('/', (req, res, next) => {
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
            message: 'Nickname or password format invalid'
        });
      return;
    }

    let usersWithNickname = await db.all(`SELECT * FROM users WHERE name='${req.body.nickname}'`);

    if (usersWithNickname.length != 0) {
      res.status(400).json({
          error: true,
          message: 'Nickname already taken!'
      });
      return;
    }

    // ENCRYPT
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        res.status(500).json({
            error: true,
            message: 'Server-side error has occured, please try again'
        });
        return;
      } else {
        await db.run(`INSERT INTO users(name, password) VALUES ('${req.body.nickname}', '${hash}')`);
        res.status(200).json({
            error: false,
            message: 'Success, account created'
        })
      }
    });
});

module.exports = router;