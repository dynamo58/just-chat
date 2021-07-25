const express = require('express');
const router = express.Router();
const path = require('path');

let publicDir = path.join(__dirname, '..', '..', 'public', 'home');

router.get('/', async (req, res, next) => {
    res.sendFile('index.html', { root: publicDir }, (err) => {
        if (err) console.log(err);
    });
});

module.exports = router;