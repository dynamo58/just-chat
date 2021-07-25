
<p align='center'>
    <img width='256px' height='32px' src='./public/logo.gif'>
</p>

# About just-chat

just-chat is a very simple chat app made with [Node.js](https://nodejs.org/en/) and [socket.io](https://socket.io/). It is very simple, lightweight and deploy-ready.

# How to run locally

1. `git clone https://github.com/dynamo58/just-chat`
2. `cd just-chat`
3. `npm install`
4. `npm start`

Note that you must have a PostgreSQL server, address has to be added to the environment variables (the server must have SSL enabled, otherwise you'd need to go and modify a couple of files in the repo). If you've done that, the application is running from the terminal and is available at localhost:3000.