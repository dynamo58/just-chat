let socket = io.connect();

let form = document.getElementById('form');
let input = document.getElementById('input');
let nickname = document.getElementById('nickname');
let own_messages = document.getElementById('own_messages');
let foreign_messages = document.getElementById('foreign_messages');


// handle message sending
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (input.value && nickname.value) {
        messageData = {
            "nick": nickname.value,
            "text": input.value
        }

        socket.emit('chat message', messageData);
        input.value = '';
    }
});


// handle incoming messages from the server
socket.on('chat message', (msg) => {
    let item = document.createElement('li');
    let fake_item = document.createElement('li');
    fake_item.textContent = "⠀";
    fake_item.classList.add('fake_message');

    if (msg.nick == nickname.value) {
        item.textContent = msg.text;
        own_messages.appendChild(item);
        foreign_messages.appendChild(fake_item);
    } else {
        item.textContent = msg.nick + ": " + msg.text;
        foreign_messages.appendChild(item);
        own_messages.appendChild(fake_item);
    }
    item.classList.add('message');

    window.scrollTo(0, document.body.scrollHeight);
});