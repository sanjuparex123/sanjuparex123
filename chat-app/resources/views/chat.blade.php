<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Reverb Chat</title>
    @vite(['resources/js/app.js'])
    <style>
        body { font-family: sans-serif; background: #f5f7fb; margin: 0; padding: 24px; }
        .card { max-width: 760px; margin: 0 auto; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,.08); }
        .messages { border: 1px solid #e5e7eb; border-radius: 10px; height: 360px; overflow-y: auto; padding: 12px; margin-bottom: 12px; }
        .message { margin-bottom: 10px; }
        .meta { color: #64748b; font-size: 12px; }
        form { display: grid; gap: 10px; }
        input, textarea, button { font: inherit; padding: 10px; border-radius: 8px; border: 1px solid #d1d5db; }
        button { background: #111827; color: white; cursor: pointer; border: none; }
    </style>
</head>
<body>
<div class="card">
    <h1>Realtime Chat (Laravel + Reverb)</h1>

    <div id="messages" class="messages">
        @foreach($messages as $message)
            <div class="message">
                <strong>{{ $message->user_name }}</strong>
                <div>{{ $message->body }}</div>
                <div class="meta">{{ $message->created_at }}</div>
            </div>
        @endforeach
    </div>

    <form id="chat-form" action="{{ route('chat.store') }}" method="POST">
        @csrf
        <input id="user_name" name="user_name" placeholder="Your name" required maxlength="80" />
        <textarea id="body" name="body" rows="3" placeholder="Type your message..." required maxlength="1000"></textarea>
        <button type="submit">Send</button>
    </form>
</div>
</body>
</html>
