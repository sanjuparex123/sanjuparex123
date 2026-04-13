import './bootstrap';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
});

const list = document.getElementById('messages');
const form = document.getElementById('chat-form');
const body = document.getElementById('body');

const appendMessage = (payload) => {
    if (!list) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'message';

    const user = document.createElement('strong');
    user.textContent = payload.user_name;

    const text = document.createElement('div');
    text.textContent = payload.body;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = payload.created_at ?? 'just now';

    wrapper.append(user, text, meta);
    list.appendChild(wrapper);
    list.scrollTop = list.scrollHeight;
};

window.Echo.channel('chat-room').listen('.message.sent', (event) => {
    appendMessage(event);
});

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = document.querySelector('input[name="_token"]')?.value;
        const userName = document.getElementById('user_name')?.value ?? 'Guest';

        const response = await window.axios.post(form.action, {
            _token: token,
            user_name: userName,
            body: body.value,
        });

        appendMessage(response.data.message);
        body.value = '';
    });
}
