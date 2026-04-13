<?php

use App\Http\Controllers\ChatMessageController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/chat');
Route::get('/chat', [ChatMessageController::class, 'index'])->name('chat.index');
Route::post('/chat/messages', [ChatMessageController::class, 'store'])->name('chat.store');
