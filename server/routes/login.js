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
            message: 'Nickname or password invalid'
        });
      return;
    }

    client.query(`SELECT * FROM users WHERE name='${req.body.nickname}'`, (err, res) => {
        if (err) {
            console.log(err);
            return;
        }

        if (res.rows.length != 1) {
            res.status(400).json({
                error: true,
                message: 'Nickname or password invalid'
            });
            return;
        }

        bcrypt.compare(req.body.password, res.rows[0].password, (err, result) => {
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
                    nickname: res.rows[0].name,
                    id: res.rows[0].id
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
});

module.exports = router;