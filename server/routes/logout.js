const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.cookie('_a', '', {maxAge: 1000, sameSite: 'strict', secure: true});
    res.redirect('/');
});

module.exports = router;