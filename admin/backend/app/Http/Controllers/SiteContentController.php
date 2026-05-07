<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Services\StorefrontRevalidationService;

class SiteContentController extends Controller
{
    public function __construct(private StorefrontRevalidationService $storefrontRevalidation)
    {
    }

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

        $this->revalidateSiteContent();

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

        $this->revalidateSiteContent();

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
            $file = $request->file('image');
            $key  = $request->input('key');

            // Hero banner is always saved with a fixed filename so the web
            // can reference a predictable path (hero_1.<ext>).
            if ($key === 'home_hero_banner') {
                $extension = $file->getClientOriginalExtension();
                $filename  = "hero_1.{$extension}";
                $path      = $file->storeAs('web', $filename, 'public');
            } else {
                $path = $file->store('web', 'public');
            }

            /** @var \Illuminate\Filesystem\FilesystemAdapter $publicDisk */
            $publicDisk = Storage::disk('public');
            $url = $publicDisk->url($path);

            $this->revalidateSiteContent();

            return response()->json([
                'url'  => $url,
                'path' => $path,
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

    private function revalidateSiteContent(): void
    {
        $this->storefrontRevalidation->revalidate([
            StorefrontRevalidationService::SITE_CONTENT,
        ]);
    }
}
