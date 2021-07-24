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
    const { Client } = require('pg');

    const connectionString = process.env.DATABASE_URL;
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    let nickname_regex = /^([a-zA-Z0-9_]){3,16}$/.exec(req.body.nickname);
    let password_regex = /^([a-zA-Z0-9_$€!?&@|%><]){8,32}$/.exec(req.body.password);

    if (nickname_regex == null || password_regex == null) {
        res.status(400).json({
            error: true,
            message: 'Nickname or password format invalid'
        });
      return;
    }

    client.query(`SELECT * FROM users WHERE name='${req.body.nickname}'`, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }

      if (res.rows.length != 0) {
        res.status(400).json({
            error: true,
            message: 'Nickname already taken!'
        });
        return;
      }

      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) {
          res.status(500).json({
              error: true,
              message: 'Server-side error has occured, please try again'
          });
          return;
        } else {
          client.query(`INSERT INTO users(name, password) VALUES ('${req.body.nickname}', '${hash}')`, (err, res) => {
            if (err) {
              console.log(err);
              return;
            }

            res.status(200).json({
              error: false,
              message: 'Success, account created'
            });
          });
        }
      });
    });
});

module.exports = router;