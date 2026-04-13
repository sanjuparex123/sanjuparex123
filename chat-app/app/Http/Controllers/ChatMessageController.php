<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ChatMessageController extends Controller
{
    public function index(): View
    {
        $messages = Message::query()->latest()->take(50)->get()->reverse()->values();

        return view('chat', [
            'messages' => $messages,
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $payload = $request->validate([
            'user_name' => ['required', 'string', 'max:80'],
            'body' => ['required', 'string', 'max:1000'],
        ]);

        $message = Message::query()->create($payload);

        broadcast(new MessageSent($message))->toOthers();

        if ($request->wantsJson()) {
            return response()->json(['message' => $message], 201);
        }

        return back();
    }
}
