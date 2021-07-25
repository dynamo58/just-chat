let form = document.getElementById('signup_form');
let tos_checkbox = document.getElementById('tos_checkbox');
let nickname = document.getElementsByName('nickname')[0];
let password = document.getElementsByName('password')[0];

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        document.getElementById('invalid_credentials').outerHTML = '';
    } catch {}

    try {
        document.getElementById('invalid_tos').outerHTML = '';
    } catch {}

    try {
        document.getElementById('processing_err').outerHTML = '';
    } catch {}

    try {
        document.getElementById('success').outerHTML = '';
        document.getElementById('success').outerHTML = '';
    } catch {}

    let nickname_regex = /^([a-zA-Z0-9_]){3,16}$/.exec(nickname.value);
    let password_regex = /^([a-zA-Z0-9_$€!?&@|%><]){8,32}$/.exec(password.value);

    if (nickname_regex === null || password_regex === null) {
        let invalidCredentials = document.createElement('p');
        invalidCredentials.setAttribute('id', 'invalid_credentials');
        invalidCredentials.textContent = 'Invalid nickname or password';
        form.appendChild(invalidCredentials);
        
        return;
    }
    
    if (!tos_checkbox.checked) {
        let invalidCredentials = document.createElement('p');
        invalidCredentials.setAttribute('id', 'invalid_tos');
        invalidCredentials.textContent = 'You must agree to the ToS';
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
            } else {
                response_info.setAttribute('id', 'success');

                let redirect_info = document.createElement('p');
                redirect_info.textContent = 'You will be redirected to login page in 5s';
                redirect_info.setAttribute('id', 'success');
                form.appendChild(redirect_info);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 5000);
            }
            response_info.textContent = res.message;
            form.appendChild(response_info);
        });
});