<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SiteContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SiteContent::query();
        
        if ($request->has('section')) {
            $query->where('section', $request->section);
        }
        
        return response()->json(['data' => $query->get()]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'nullable|string',
            'section' => 'sometimes|string',
            'type' => 'sometimes|string',
            'description' => 'nullable|string',
        ]);

        $content = SiteContent::setContent(
            $key,
            $validated['value'] ?? null,
            $validated['section'] ?? 'home',
            $validated['type'] ?? 'text',
            $validated['description'] ?? null
        );

        return response()->json(['data' => $content]);
    }

    /**
     * Handle bulk updates.
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contents' => 'required|array',
            'contents.*.key' => 'required|string',
            'contents.*.value' => 'nullable|string',
            'contents.*.section' => 'sometimes|string',
            'contents.*.type' => 'sometimes|string',
        ]);

        $updated = [];
        foreach ($validated['contents'] as $item) {
            $content = SiteContent::setContent(
                $item['key'],
                $item['value'] ?? null,
                $item['section'] ?? 'home',
                $item['type'] ?? 'text'
            );
            $updated[] = $content;
        }

        return response()->json(['data' => $updated]);
    }

    /**
     * Upload an image for site content.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|max:5120',
            'key' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('web', 'public');
            $url = Storage::disk('public')->url($path);
            
            return response()->json([
                'url' => $url,
                'path' => $path
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 400);
    }

    /**
     * Display a listing of the resource for public consumption.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = SiteContent::query();
        
        if ($request->has('section')) {
            $query->where('section', $request->section);
        }
        
        $contents = $query->get();
        $data = [];
        foreach ($contents as $content) {
            $data[$content->key] = $content->value;
        }
        
        return response()->json(['data' => $data]);
    }
}
