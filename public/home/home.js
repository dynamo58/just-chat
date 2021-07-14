//document.getElementById('messages').setAttribute('height');
window.onload = () => {
    let h =document.getElementById('messages').clientHeight;
    document.getElementById('messages').style.maxHeight = h + "px";

    const socket = io.connect();

    //console.log(socket);

    let form = document.getElementById('form');
    let input = document.getElementById('input');
    let own_messages = document.getElementById('own_messages');
    let foreign_messages = document.getElementById('foreign_messages');


    // handle message sending
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (socket.clientNickname) {
            if (input.value) {
                socket.emit('message', { "text": input.value });
                input.value = '';
            }
        } else {
            alert('You are not logged in');
        }
    });

    socket.on('authentification result', (auth) => {
        if (auth.error) {
            console.log(auth.message);
            return;
        }

        socket.clientNickname = auth.nickname;

        const status_bar = document.getElementById('status');
        const log_button = document.getElementById('log_button');
        status_bar.textContent = 'Logged in as ' + auth.nickname;
        log_button.setAttribute('href', '/logout');
        log_button.textContent = 'Log out';

        socket.emit('request previous messages', {});
    });

    socket.on('message', (msg) => {
        let item = document.createElement('li');
        let fake_item = document.createElement('li');
        fake_item.innerHTML = '<span class="message_content">⠀</span>';
        fake_item.classList.add('fake_message');

        if (msg.nick == socket.clientNickname) {
            item.innerHTML = `<span class="message_content">${msg.text}</span>` ;
            own_messages.appendChild(item);
            foreign_messages.appendChild(fake_item);
        } else {
            item.innerHTML = `<span class="message_content">${msg.nick}: ${msg.text}</span>`;
            foreign_messages.appendChild(item);
            own_messages.appendChild(fake_item);
        }
        item.classList.add('message');

        document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    });
}
