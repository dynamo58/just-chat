const cookies_resolved = localStorage.getItem('cookie_resolved');

if (cookies_resolved === null) {
    document.getElementsByTagName('body')[0].innerHTML += `
        <div id='cookie_consent' class='cookie_consent'>
            <div>
                <p>
                    This website uses cookies to function. Click <a href='/tos#cookies'>here</a> here to learn about how we use them. By clicking 'Accept' you consent for us to use them.
                </p>
            </div>
            <div>
                <a id='cookie_accept_button' class='button button-blue'>Accept</a>
            </div>
        </div>
    `

    document.getElementById('cookie_accept_button').onclick = () => {
        localStorage.setItem('cookie_resolved', 'accepted');
        location.reload();
    }
} else if (cookies_resolved === 'accepted') {
    try {
        let socket_script = document.createElement('script');
        socket_script.src = '/socket.io/socket.io.js';
        socket_script.defer = true;
        let home_script = document.createElement('script');
        home_script.src = '../home/home.js';

        document.getElementById('home-body').append(socket_script);
        document.getElementById('home-body').append(home_script);
    } catch { }
}