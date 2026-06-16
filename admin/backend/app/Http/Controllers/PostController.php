<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Http\Resources\PostResource;
use App\Services\ImageValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    protected $imageValidationService;

    public function __construct(ImageValidationService $imageValidationService)
    {
        $this->imageValidationService = $imageValidationService;
    }
    /**
     * Display a listing of published articles (public).
     */
    public function publicIndex(Request $request)
    {
        $query = Post::with(['author', 'category', 'tags'])->where('status', 'published');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhereHas('category', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('tags', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('author', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('category_slug')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->input('category_slug'));
            });
        }

        if ($request->filled('tag_id')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tags.id', $request->input('tag_id'));
            });
        }

        if ($request->filled('tag_slug')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->input('tag_slug'));
            });
        }

        $sortBy = $request->input('sort_by', 'published_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSortBy = ['id', 'title', 'published_at'];
        if (in_array($sortBy, $allowedSortBy)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 12);
        return PostResource::collection($query->paginate($perPage));
    }

    /**
     * Display a single published article (public).
     */
    public function publicShow($slug)
    {
        $post = Post::where('slug', $slug)->first();
        
        if (!$post || $post->status !== 'published') {
            return response()->json(['message' => 'Article not found'], 404);
        }

        return new PostResource($post->load(['author', 'category', 'tags', 'media']));
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Post::with(['author', 'category', 'tags']);

        // Search by title
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        // Filter by category_id
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSortBy = ['id', 'title', 'created_at', 'published_at', 'order', 'featured'];
        if (in_array($sortBy, $allowedSortBy)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return PostResource::collection($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $coverRules = $this->imageValidationService->buildValidationRules('blog_cover', 'cover');
        $galleryRules = $this->imageValidationService->buildValidationRules('blog_gallery', 'gallery');

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'order' => 'nullable|integer',
            'featured' => 'nullable|boolean',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'cover' => 'nullable|file|' . implode('|', $coverRules),
            'gallery' => 'nullable|array',
            'gallery.*' => 'nullable|file|' . implode('|', $galleryRules),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['featured'] = $request->boolean('featured');
        $data['user_id'] = Auth::id() ?? 1;

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (Post::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = Post::create($data);

        if ($request->has('tag_ids')) {
            $post->tags()->sync($request->input('tag_ids'));
        }

        if ($request->hasFile('cover')) {
            $coverConfig = $this->imageValidationService->getConfig('blog_cover');
            if ($coverConfig && ($coverConfig->min_width || $coverConfig->max_width || $coverConfig->min_height || $coverConfig->max_height || $coverConfig->aspect_ratio)) {
                $dimensionValidation = $this->imageValidationService->validateDimensions($request->file('cover'), $coverConfig);
                if (!$dimensionValidation['valid']) {
                    $post->delete();
                    return response()->json(['errors' => ['cover' => $dimensionValidation['errors']]], 422);
                }
            }
            $post->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        if ($request->hasFile('gallery')) {
            $galleryConfig = $this->imageValidationService->getConfig('blog_gallery');
            foreach ($request->file('gallery') as $image) {
                if ($image && $image->isValid()) {
                    if ($galleryConfig && ($galleryConfig->min_width || $galleryConfig->max_width || $galleryConfig->min_height || $galleryConfig->max_height || $galleryConfig->aspect_ratio)) {
                        $dimensionValidation = $this->imageValidationService->validateDimensions($image, $galleryConfig);
                        if (!$dimensionValidation['valid']) {
                            return response()->json(['errors' => ['gallery' => $dimensionValidation['errors']]], 422);
                        }
                    }
                    $post->addMedia($image)->toMediaCollection('gallery');
                }
            }
        }

        if ($data['status'] === 'published') {
            $this->triggerRevalidation($post->slug);
        }

        return new PostResource($post->load(['author', 'category', 'tags']));
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return new PostResource($post->load(['author', 'category', 'tags', 'media']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        $coverRules = $this->imageValidationService->buildValidationRules('blog_cover', 'cover');
        $galleryRules = $this->imageValidationService->buildValidationRules('blog_gallery', 'gallery');

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug,' . $post->id,
            'content' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'order' => 'nullable|integer',
            'featured' => 'nullable|boolean',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'cover' => 'nullable|file|' . implode('|', $coverRules),
            'gallery.*' => 'nullable|file|' . implode('|', $galleryRules),
            'remove_gallery' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['featured'] = $request->boolean('featured');

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (Post::where('slug', $data['slug'])->where('id', '!=', $post->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        if ($data['status'] === 'published' && empty($data['published_at']) && empty($post->published_at)) {
            $data['published_at'] = now();
        }

        $post->update($data);

        if ($request->has('tag_ids')) {
            $post->tags()->sync($request->input('tag_ids'));
        }

        if ($request->hasFile('cover')) {
            $coverConfig = $this->imageValidationService->getConfig('blog_cover');
            if ($coverConfig && ($coverConfig->min_width || $coverConfig->max_width || $coverConfig->min_height || $coverConfig->max_height || $coverConfig->aspect_ratio)) {
                $dimensionValidation = $this->imageValidationService->validateDimensions($request->file('cover'), $coverConfig);
                if (!$dimensionValidation['valid']) {
                    return response()->json(['errors' => ['cover' => $dimensionValidation['errors']]], 422);
                }
            }
            $post->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        if ($request->hasFile('gallery')) {
            $galleryConfig = $this->imageValidationService->getConfig('blog_gallery');
            foreach ($request->file('gallery') as $image) {
                if ($galleryConfig && ($galleryConfig->min_width || $galleryConfig->max_width || $galleryConfig->min_height || $galleryConfig->max_height || $galleryConfig->aspect_ratio)) {
                    $dimensionValidation = $this->imageValidationService->validateDimensions($image, $galleryConfig);
                    if (!$dimensionValidation['valid']) {
                        return response()->json(['errors' => ['gallery' => $dimensionValidation['errors']]], 422);
                    }
                }
                $post->addMedia($image)->toMediaCollection('gallery');
            }
        }

        if ($request->has('remove_gallery')) {
            $mediaToRemove = $post->getMedia('gallery')
                ->whereIn('id', $request->input('remove_gallery'));
            foreach ($mediaToRemove as $media) {
                $media->delete();
            }
        }

        if ($data['status'] === 'published') {
            $this->triggerRevalidation($post->slug);
        }

        return new PostResource($post->load(['author', 'category', 'tags']));
    }

    /**
     * Quick update partial fields (featured, status, order).
     */
    public function quickUpdate(Request $request, Post $post)
    {
        $validator = Validator::make($request->all(), [
            'featured' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published,archived',
            'order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (isset($data['featured'])) {
            $post->featured = $data['featured'];
        }

        if (isset($data['status'])) {
            $post->status = $data['status'];
            if ($data['status'] === 'published' && empty($post->published_at)) {
                $post->published_at = now();
            }
        }

        if (isset($data['order'])) {
            $post->order = $data['order'];
        }

        $post->save();

        if (isset($data['status']) && $data['status'] === 'published') {
            $this->triggerRevalidation($post->slug);
        }

        return new PostResource($post->load(['author', 'category', 'tags']));
    }

    public function deleteGalleryImage(Post $post, $mediaId)
    {
        $media = $post->getMedia('gallery')->firstWhere('id', $mediaId);

        if (!$media) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $media->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->delete();

        return response()->noContent();
    }

    /**
     * Bulk delete multiple posts.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:posts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ids = $request->input('ids');
        Post::whereIn('id', $ids)->delete();

        return response()->noContent();
    }

    /**
     * Trigger on-demand revalidation in Next.js
     */
    private function triggerRevalidation(?string $slug = null): void
    {
        $revalidate = function () use ($slug): void {
            $webhookUrl = config('app.revalidate_webhook_url');
            $token = config('app.revalidate_token');

            if (!$webhookUrl || !$token) {
                return;
            }

            try {
                $url = $webhookUrl . '?token=' . $token;
                if ($slug) {
                    $url .= '&slug=' . $slug;
                }

                Http::connectTimeout(1)->timeout(2)->post($url);
            } catch (\Exception $e) {
                \Log::warning('Failed to trigger Next.js revalidation: ' . $e->getMessage());
            }
        };

        if (app()->runningInConsole()) {
            $revalidate();

            return;
        }

        app()->terminating($revalidate);
    }
}
