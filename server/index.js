//require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http').Server(app);
const io = require("socket.io")(http);


http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


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


// Handle HTML requests
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/home'));
app.use('/signup', require('./routes/signup'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));

const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  let cookie = socket.handshake.headers.cookie;
  cookie = cookie.substr(cookie.indexOf('_a=')+3);
  jwt.verify(cookie, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      socket.emit('authentification result', {
        error: true,
        message: 'Invalid / nonexistant token, please log in.'
      });
      return
    }

    socket.emit('authentification result', {
      error: false,
      message: 'Token validation successfull',
      nickname: decoded.nickname
    });

    socket.decoded = decoded;
    next();
  });
}).on('connection', (socket) => {
  socket.on('request previous messages', async () => {
    let messages = await db.all(`SELECT * FROM messages ORDER BY 'id' ASC`);

    for (let message of messages) {
      let nick = message.user;
      let text = message.msg;

      socket.emit('message', {nick, text});
    }
  });

  socket.on('message', async (msg) => {
    await db.run(`INSERT INTO messages ('user', 'msg') VALUES ('${socket.decoded.nickname}', '${msg.text}');`)

    io.emit('message', {
      text: msg.text,
      nick: socket.decoded.nickname
    })
  })
});