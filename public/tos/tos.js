let form = document.getElementById('contact_form');
let message = document.getElementsByName('message')[0];

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        document.getElementById('processing_err').outerHTML = '';
    } catch { }

    try {
        document.getElementById('success').outerHTML = '';
    } catch { }

    await fetch('#', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:
            JSON.stringify({
                message: message.value,
            }
            )
    }
    )
        .then(res => res.json())
        .then(res => {
            let response_info = document.createElement('p');

            if (res.error) {
                response_info.setAttribute('id', 'processing_err');
                response_info.textContent = res.message;
            } else {
                response_info.setAttribute('id', 'success');
                response_info.textContent = res.message;
            }

            message.value = '';
            form.appendChild(response_info);
            window.scrollTo(0, document.body.scrollHeight);
        });
});

document.getElementById('downloadData').onclick = async () => {
    await fetch('/tos/data/download', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    )
        .then(res => res.json())
        .then(res => {
            if (!res.error) {
                const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));

                let downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", data);
                downloadAnchorNode.setAttribute("download", "data.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            } else {
                alert('Please log in before downloading data.');
            }
        });
}

document.getElementById('deleteAccount').onclick = async () => {
    if (confirm('Are you really sure you want to delete your account? All of the data related to your account will be deleted and lost forever.')) {
        await fetch('/tos/data/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        )
            .then(res => res.json)
            .then(res => {

                if (res.error) {
                    alert(`An error occured, message: ${res.message}`)
                } else {
                    window.location.href = '/';
                }
            })
    }
}