let form = document.getElementById('login_form');
let nickname = document.getElementsByName('nickname')[0];
let password = document.getElementsByName('password')[0];

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (localStorage.getItem('cookie_resolved') !== 'accepted') {
        let invalidCredentials = document.createElement('p');
        invalidCredentials.setAttribute('id', 'invalid_credentials');
        invalidCredentials.textContent = 'You must accept cookies in order to proceed';
        form.appendChild(invalidCredentials);

        return;
    }

    try {
        document.getElementById('invalid_credentials').outerHTML = '';
        document.getElementById('invalid_credentials').outerHTML = '';
    } catch { }

    try {
        document.getElementById('processing_err').outerHTML = '';
    } catch { }

    try {
        document.getElementById('success').outerHTML = '';
        document.getElementById('success').outerHTML = '';
    } catch { }

    let nickname_regex = /^([a-zA-Z0-9_]){3,16}$/.exec(nickname.value);
    let password_regex = /^([a-zA-Z0-9_$€!?&@|%><]){8,32}$/.exec(password.value);

    if (nickname_regex === null || password_regex === null) {
        let invalidCredentials = document.createElement('p');
        invalidCredentials.setAttribute('id', 'invalid_credentials');
        invalidCredentials.textContent = 'Invalid nickname or password';
        form.appendChild(invalidCredentials);

        return;
    }

    await fetch('#', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:
            JSON.stringify({
                nickname: nickname.value,
                password: password.value
            })
        }
    )
        .then(res => res.json())
        .then(res => {
            let response_info = document.createElement('p');
            if (res.error) {
                response_info.setAttribute('id', 'processing_err');
                response_info.textContent = res.message;
                form.appendChild(response_info);
            } else {
                window.location.href = '/';
            }
        });
});