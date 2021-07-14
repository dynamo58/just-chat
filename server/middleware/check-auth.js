const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const decoded = jwt.verify(req.cookies.__a, process.env.JWT_KEY);
        req.userData = decoded;
    } catch (err) {
        req.userData = false;
    }

    console.log(req.userData)
    next()
}