# Laravel Reverb Chat App (Starter)

This folder contains a ready-to-wire chat app skeleton using **Laravel + Reverb + Echo**.

## What is included

- Public chat page (`/chat`)
- Message persistence (`messages` table)
- Broadcast event (`MessageSent`)
- Reverb broadcasting config (`config/broadcasting.php`)
- Echo client setup in JavaScript

## Download this starter

From repository root, you can package this app into a ZIP file:

```bash
./download-chat-app.sh
```

This creates `chat-app-download.zip` that you can share or upload.

## 1) Install Laravel + dependencies

```bash
cd chat-app
composer install
npm install
```

> If you are creating this in a fresh project, make sure your `composer.json` includes `laravel/framework` and your app is Laravel 11+.

## 2) Environment setup

Copy `.env.example` to `.env`, then set:

```env
APP_NAME="Reverb Chat"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

BROADCAST_CONNECTION=reverb

REVERB_APP_ID=chat-app
REVERB_APP_KEY=local-app-key
REVERB_APP_SECRET=local-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

Generate key and DB file:

```bash
php artisan key:generate
mkdir -p database && touch database/database.sqlite
php artisan migrate
```

## 3) Install and run Reverb

```bash
php artisan install:broadcasting
php artisan reverb:start
```

## 4) Run app + frontend build

In separate terminals:

```bash
php artisan serve
npm run dev
```

Then open: `http://127.0.0.1:8000/chat`

## 5) How it works

1. User submits a message to `POST /chat/messages`
2. Message is saved to DB
3. `MessageSent` is broadcast to `chat-room`
4. Echo listens and appends incoming messages in real time

