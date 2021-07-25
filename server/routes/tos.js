const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');

let publicDir = path.join(__dirname, '..', '..', 'public', 'tos');

router.get('/', async (req, res, next) => {
    res.sendFile('index.html', { root: publicDir }, (err) => {
        if (err) console.log(err);
    });
});

const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL
const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.post('/', async (req, res, next) => {
    client.query(`INSERT INTO inquiries(msg) VALUES ('${req.body.message}')`, (err, queryRes) => {
        if (err) {
            console.log(err);

            res.status(400).json({
                error: true,
                message: 'Server-side error has occured'
            });

            return;
        }

        res.status(200).json({
            error: false,
            message: 'Message received, thank you!'
        });
    });
});

router.get('/data/download', (req, res, next) => {
    let cookie;
    try {
        cookie = req.headers.cookie.substr(3);
    } catch {
        res.status(400).json({
            error: true,
            message: 'Please log in before proceeding'
        });

        return;
    }

    jwt.verify(cookie, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            res.status(400).json({
                error: true,
                message: 'Bad request'
            });

            return
        }

        client.query(`SELECT * FROM messages WHERE name='${decoded.nickname}'`, (err, queryRes) => {
            if (err) {
                console.log(err);
                res.status(400).json({
                    error: true,
                    message: 'Bad request'
                });

                return
            }

            res.status(200).json({
                error: false,
                message: 'Operation successfull, please accept the download prompt',
                data: queryRes.rows
            });
        });
    });
});

router.delete('/data/delete', (req, res, next) => {
    let cookie;
    try {
        cookie = req.headers.cookie.substr(3);
    } catch {
        res.status(400).json({
            error: true,
            message: 'Please log in before proceeding'
        });

        return;
    }

    jwt.verify(cookie, process.env.JWT_KEY, (er, decoded) => {
        if (er) {
            res.status(400).json({
                error: true,
                message: 'Bad request'
            });

            return
        }

        client.query(`DELETE FROM messages WHERE name='${decoded.nickname}'`, (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    error: true,
                    message: 'Error while processing, please try again.'
                });

                return
            }

            client.query(`DELETE FROM users WHERE name='${decoded.nickname}'`, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({
                        error: true,
                        message: 'Error while processing, please try again.'
                    });

                    return
                }

                res.cookie('_a', '', { maxAge: 1000, sameSite: 'strict', secure: true });
                res.status(200).json({
                    error: false,
                    message: 'Operation successfull'
                });
            });
        });
    });
});

module.exports = router;