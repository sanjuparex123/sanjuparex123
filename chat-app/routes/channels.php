<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat-room', static function (): bool {
    return true;
});
