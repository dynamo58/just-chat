try {
  require('dotenv').config();
} catch {}

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http').Server(app);
const io = require("socket.io")(http);
const { Client } = require('pg');


http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// connect to database
const connectionString = process.env.DATABASE_URL
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

client.query(`
CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(16) UNIQUE NOT NULL,
  password VARCHAR(32) NOT NULL
);
`, (err, res) => {
  if (err) {
    console.log({err});
    return;
  }
})

client.query(`
CREATE TABLE IF NOT EXISTS messages(
    id SERIAL PRIMARY KEY,
    name VARCHAR(16),
    msg VARCHAR(2047),
    CONSTRAINT fk_user
      FOREIGN KEY(name)
        REFERENCES users(name)
);
`, (err, res) => {
  if (err) {
    console.log({err});
    return;
  }
});

client.query(`INSERT INTO users (name, password) VALUES ('hackermans', 'hackme')`, (err, res) => {
  if (err) {
    console.log({err});
    return;
  }
});

client.query(`INSERT INTO messages (name, msg) VALUES ('hackermans', '1337')`, (err, res) => {
  if (err) {
    console.log({err});
    return;
  }
});

client.query(`SELECT * FROM messages`, (err, res) => {
  if (err) {
    console.log({err});
    return;
  }

  console.log(res.rows);
});

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
    client.query(`SELECT * FROM messages ORDER BY id ASC`, (err, res) => {
      if (err) {
        console.log({err});
        return;
      }

      console.log({res});

      for (let message of res) {
        let nick = message.user;
        let text = message.msg;
  
        socket.emit('message', {nick, text});
      }
    });
  });

  socket.on('message', async (msg) => {
    client.query(`INSERT INTO messages (name, msg) VALUES ('${socket.decoded.nickname}', '${msg.text}');`, (err, res) => {
      if (err) console.log({err});
    });

    io.emit('message', {
      text: msg.text,
      nick: socket.decoded.nickname
    })
  })
});