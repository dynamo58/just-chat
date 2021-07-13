const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http').Server(app);
const io = require("socket.io")(http);


http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


// connect to database
const sqlite = require('sqlite3').verbose()
let db = new sqlite.Database('./data/db.db', (err) => {
  if (err) console.log(err);
});


// promisify the db methods
const util = require('util');
db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);


// server page to incoming GET requests
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile("index.html");
});


// handle connecting sockets
io.on('connection', async (socket) => {
  let messages = await db.all(`SELECT * FROM messages ORDER BY 'id' ASC`);

  for (let message of messages) {
    let nick = message.nick;
    let text = message.msg;

    socket.emit('chat message', {nick, text});
  }

  // socket.on('disconnect', () => {
  //     console.log('[socket.io] a user disconnected');
  //   });

  socket.on('chat message', async (msg) => {
    await db.run(`INSERT INTO messages ('nick', 'msg') VALUES ('${msg.nick}', '${msg.text}');`)
    io.emit('chat message', msg);
  })
});

//server.listen(3000);