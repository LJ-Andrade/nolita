<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductVariantResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Services\StorefrontRevalidationService;

class ProductController extends Controller
{
    public function __construct(private StorefrontRevalidationService $storefrontRevalidation)
    {
    }

    public function publicIndex(Request $request)
    {
        $query = Product::with(['author', 'category', 'tags'])->where('status', 'published');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('tag_id')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('product_tags.id', $request->input('tag_id'));
            });
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSortBy = ['id', 'name', 'created_at'];
        if (in_array($sortBy, $allowedSortBy)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return ProductResource::collection($query->paginate(12));
    }

    public function publicShow($slug)
    {
        $product = Product::where('slug', $slug)->first();
        
        if (!$product || $product->status !== 'published') {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return new ProductResource($product->load(['author', 'category', 'tags', 'media']));
    }

    public function index(Request $request)
    {
        $query = Product::with(['author', 'category', 'tags', 'variants.color', 'variants.size']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSortBy = ['id', 'name', 'created_at', 'order', 'featured'];
        if (in_array($sortBy, $allowedSortBy)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return ProductResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:products,code',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . ($id ?? 'NULL') . ',id',
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'status' => 'required|in:draft,published,archived',
            'category_id' => 'nullable|exists:product_categories,id',
            'wholesale_price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:product_tags,id',
            'size_ids' => 'nullable|array',
            'size_ids.*' => 'exists:product_sizes,id',
            'featured' => 'nullable|boolean',
            'order' => 'nullable|integer',
            'cover' => 'nullable|image|max:5120',
            'gallery' => 'nullable|array',
            'gallery.*' => 'nullable|image|max:5120',
            'document' => 'nullable|file|mimes:pdf,txt,doc,docx|max:5120',
            'color_ids' => 'nullable|array',
            'color_ids.*' => 'exists:product_colors,id',
            'variants' => 'nullable|array',
            'variants.*.product_color_id' => 'nullable|exists:product_colors,id',
            'variants.*.product_size_id' => 'nullable|exists:product_sizes,id',
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.wholesale_price' => 'nullable|numeric|min:0',
            'variants.*.discount' => 'nullable|numeric|min:0',
            'variants.*.active' => 'nullable|boolean',
            'remove_color_images' => 'nullable|array',
            'color_images' => 'nullable|array',
            'color_images.*.color_id' => 'required_with:color_images|exists:product_colors,id',
            'color_images.*.file' => 'required_with:color_images|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['featured'] = $request->boolean('featured');
        $data['user_id'] = Auth::id() ?? 1;

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (Product::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $product = Product::create($data);

        if ($request->has('tag_ids')) {
            $product->tags()->sync($request->input('tag_ids'));
        }

        if ($request->has('size_ids')) {
            $product->sizes()->sync($request->input('size_ids'));
        }

        if ($request->has('color_ids')) {
            $product->colors()->sync($request->input('color_ids'));
        }

        if ($request->has('variants')) {
            $variants = $request->input('variants');
            foreach ($variants as $variantData) {
                // Cast active to boolean if it's string '1'/'0'
                if (isset($variantData['active'])) {
                    $variantData['active'] = filter_var($variantData['active'], FILTER_VALIDATE_BOOLEAN);
                }
                $product->variants()->create($variantData);
            }
        }

        if ($request->hasFile('cover')) {
            $extension = $request->file('cover')->getClientOriginalExtension();
            $product->addMediaFromRequest('cover')
                ->usingFileName($this->mediaFileName('cover', $extension))
                ->toMediaCollection('cover');
        } elseif ($request->has('remove_cover') && $request->input('remove_cover') === '1') {
            // Remove existing cover image
            $product->clearMediaCollection('cover');
        }

        if ($request->hasFile('gallery')) {
            $galleryFiles = $request->file('gallery');
            if (!is_array($galleryFiles)) {
                $galleryFiles = [$galleryFiles];
            }

            // Get the order mapping from request (filename => order_index)
            $galleryOrderJson = $request->input('gallery_order', '[]');
            $galleryOrder = json_decode($galleryOrderJson, true) ?: [];

            foreach ($galleryFiles as $index => $image) {
                if ($image && $image->isValid()) {
                    $extension = $image->getClientOriginalExtension();
                    $filename = $this->mediaFileName('gallery', $extension);

                    // Determine order: use gallery_order mapping if available, otherwise use index
                    $originalName = $image->getClientOriginalName();
                    $order = isset($galleryOrder[$originalName]) ? (int) $galleryOrder[$originalName] : $index;

                    $product->addMedia($image)
                        ->usingFileName($filename)
                        ->withCustomProperties(['order' => $order])
                        ->toMediaCollection('gallery');
                }
            }

            // Update order_column based on custom properties
            $product->getMedia('gallery')->each(function ($media) {
                if (isset($media->custom_properties['order'])) {
                    $media->order_column = $media->custom_properties['order'];
                    $media->save();
                }
            });
        }

        if ($request->hasFile('document')) {
            $product->addMediaFromRequest('document')->toMediaCollection('document');
        }

        if ($request->has('color_images')) {
            foreach ($request->input('color_images', []) as $index => $colorImageData) {
                $colorId = $colorImageData['color_id'];
                $file = $request->file("color_images.{$index}.file");
                if ($file && $file->isValid()) {
                    $extension = $file->getClientOriginalExtension();
                    $filename = $this->mediaFileName('color-' . $colorId, $extension);

                    $product->addMedia($file)
                        ->usingFileName($filename)
                        ->withCustomProperties(['color_id' => (int) $colorId])
                        ->toMediaCollection('color_images');
                }
            }
        }

        $this->revalidateCatalog();

        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes']));
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes', 'colors', 'media', 'variants.color', 'variants.size']));
    }

    public function regenerateQr(Product $product)
    {
        $product->qr_url = $product->generateQrUrl();
        $product->save();
        $this->revalidateCatalog();

        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes', 'colors', 'media', 'variants.color', 'variants.size']));
    }

    public function updateQrUrl(Request $request, Product $product)
    {
        $validated = $request->validate([
            'qr_url' => 'nullable|string|max:500',
        ]);
        
        $product->qr_url = $validated['qr_url'];
        $product->save();

        $this->revalidateCatalog();
        
        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes', 'colors', 'media', 'variants.color', 'variants.size']));
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:products,code,' . $product->id,
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'status' => 'required|in:draft,published,archived',
            'category_id' => 'nullable|exists:product_categories,id',
            'wholesale_price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:product_tags,id',
            'size_ids' => 'nullable|array',
            'size_ids.*' => 'exists:product_sizes,id',
            'featured' => 'nullable|boolean',
            'order' => 'nullable|integer',
            'cover' => 'nullable|image|max:5120',
            'gallery' => 'nullable|array',
            'gallery.*' => 'nullable|image|max:5120',
            'document' => 'nullable|file|mimes:pdf,txt,doc,docx|max:5120',
            'remove_gallery' => 'nullable|array',
            'color_ids' => 'nullable|array',
            'color_ids.*' => 'exists:product_colors,id',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'variants.*.product_color_id' => 'nullable|exists:product_colors,id',
            'variants.*.product_size_id' => 'nullable|exists:product_sizes,id',
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.wholesale_price' => 'nullable|numeric|min:0',
            'variants.*.discount' => 'nullable|numeric|min:0',
            'variants.*.active' => 'nullable|boolean',
            'remove_color_images' => 'nullable|array',
            'color_images' => 'nullable|array',
            'color_images.*.color_id' => 'required_with:color_images|exists:product_colors,id',
            'color_images.*.file' => 'required_with:color_images|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['featured'] = $request->boolean('featured');

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (Product::where('slug', $data['slug'])->where('id', '!=', $product->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $product->update($data);

        if ($request->has('tag_ids')) {
            $product->tags()->sync($request->input('tag_ids'));
        }

        if ($request->has('size_ids')) {
            $product->sizes()->sync($request->input('size_ids'));
        }

        if ($request->has('color_ids')) {
            $product->colors()->sync($request->input('color_ids'));
        }

        if ($request->has('variants')) {
            $variantsData = $request->input('variants');
            $keepIds = [];

            foreach ($variantsData as $vData) {
                // Prepare variant data, ensuring boolean conversion for 'active'
                $variantProcessedData = [
                    'product_color_id' => $vData['product_color_id'] ?? null,
                    'product_size_id' => $vData['product_size_id'] ?? null,
                    'sku' => $vData['sku'] ?? null,
                    'stock' => $vData['stock'] ?? 0,
                    'price' => $vData['price'] ?? null,
                    'wholesale_price' => $vData['wholesale_price'] ?? null,
                    'discount' => $vData['discount'] ?? null,
                    'active' => filter_var($vData['active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                ];

                if (isset($vData['id']) && $vData['id']) {
                    $variant = $product->variants()->find($vData['id']);
                    if ($variant) {
                        $variant->update($variantProcessedData);
                        $keepIds[] = $variant->id;
                    }
                } else {
                    $newVariant = $product->variants()->create($variantProcessedData);
                    $keepIds[] = $newVariant->id;
                }
            }

            $product->variants()->whereNotIn('id', $keepIds)->delete();
        }

        if ($request->hasFile('cover')) {
            $extension = $request->file('cover')->getClientOriginalExtension();
            $product->addMediaFromRequest('cover')
                ->usingFileName($this->mediaFileName('cover', $extension))
                ->toMediaCollection('cover');
        } elseif ($request->has('remove_cover') && $request->input('remove_cover') === '1') {
            // Remove existing cover image
            $product->clearMediaCollection('cover');
        }

        // Get the order mapping from request (filename => order_index)
        $galleryOrderJson = $request->input('gallery_order', '[]');
        $galleryOrder = json_decode($galleryOrderJson, true) ?: [];

        if ($request->hasFile('gallery')) {
            $galleryFiles = $request->file('gallery');
            if (!is_array($galleryFiles)) {
                $galleryFiles = [$galleryFiles];
            }

            foreach ($galleryFiles as $index => $image) {
                if ($image && $image->isValid()) {
                    $extension = $image->getClientOriginalExtension();
                    $filename = $this->mediaFileName('gallery', $extension);

                    // Determine order: use gallery_order mapping if available, otherwise use index
                    $originalName = $image->getClientOriginalName();
                    $order = isset($galleryOrder[$originalName]) ? (int) $galleryOrder[$originalName] : $index;

                    $product->addMedia($image)
                        ->usingFileName($filename)
                        ->withCustomProperties(['order' => $order])
                        ->toMediaCollection('gallery');
                }
            }
        }

        // Update order for existing gallery items
        foreach ($galleryOrder as $mediaId => $order) {
            // Skip if it's a filename (new image), process only numeric IDs (existing)
            if (is_numeric($mediaId)) {
                $mediaIdInt = (int) $mediaId;
                
                // Update order_column directly in database
                \DB::table('media')
                    ->where('id', $mediaIdInt)
                    ->where('model_type', Product::class)
                    ->where('model_id', $product->id)
                    ->where('collection_name', 'gallery')
                    ->update(['order_column' => (int) $order]);
            }
        }

        // Update order_column for new images based on custom properties
        $product->getMedia('gallery')->each(function ($media) {
            if (isset($media->custom_properties['order']) && $media->order_column !== $media->custom_properties['order']) {
                $media->order_column = $media->custom_properties['order'];
                $media->save();
            }
        });

        if ($request->has('remove_gallery')) {
            $mediaToRemove = $product->getMedia('gallery')
                ->whereIn('id', $request->input('remove_gallery'));
            foreach ($mediaToRemove as $media) {
                $media->delete();
            }
        }

        if ($request->has('remove_color_images')) {
            $removeColorIds = $request->input('remove_color_images');
            $mediaToRemove = $product->getMedia('color_images')->filter(function ($media) use ($removeColorIds) {
                return in_array($media->getCustomProperty('color_id'), $removeColorIds);
            });
            foreach ($mediaToRemove as $media) {
                $media->delete();
            }
        }

        if ($request->has('color_images')) {
            foreach ($request->input('color_images', []) as $index => $colorImageData) {
                $colorId = $colorImageData['color_id'];
                $file = $request->file("color_images.{$index}.file");
                if ($file && $file->isValid()) {
                    // Remove existing media for this color
                    $existingMedia = $product->getMedia('color_images')->filter(function ($media) use ($colorId) {
                        return $media->getCustomProperty('color_id') == $colorId;
                    });
                    foreach ($existingMedia as $media) {
                        $media->delete();
                    }

                    $extension = $file->getClientOriginalExtension();
                    $filename = $this->mediaFileName('color-' . $colorId, $extension);

                    $product->addMedia($file)
                        ->usingFileName($filename)
                        ->withCustomProperties(['color_id' => (int) $colorId])
                        ->toMediaCollection('color_images');
                }
            }
        }

        $this->revalidateCatalog();

        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes']));
    }

    public function quickUpdate(Request $request, Product $product)
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
            $product->featured = $data['featured'];
        }

        if (isset($data['status'])) {
            $product->status = $data['status'];
        }

        if (isset($data['order'])) {
            $product->order = $data['order'];
        }

        $product->save();

        $this->revalidateCatalog();

        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes', 'colors', 'variants']));
    }

    public function deleteGalleryImage(Product $product, $mediaId)
    {
        $media = $product->getMedia('gallery')->firstWhere('id', $mediaId);

        if (!$media) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $media->delete();

        $this->revalidateCatalog();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        $this->revalidateCatalog();

        return response()->noContent();
    }

public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ids = $request->input('ids');
        Product::whereIn('id', $ids)
            ->get()
            ->each(fn (Product $product) => $product->delete());

        $this->revalidateCatalog();

        return response()->noContent();
    }

    public function updateVariant(Request $request, Product $product, $variantId)
    {
        $variant = $product->variants()->find($variantId);
        
        if (!$variant) {
            return response()->json(['message' => 'Variant not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'sku' => 'nullable|string|max:255',
            'stock' => 'nullable|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'active' => 'nullable|boolean',
            'product_color_id' => 'nullable|exists:product_colors,id',
            'product_size_id' => 'nullable|exists:product_sizes,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        if (isset($data['active'])) {
            $data['active'] = filter_var($data['active'], FILTER_VALIDATE_BOOLEAN);
        }

        $variant->update($data);

        $this->revalidateCatalog();

        return new ProductVariantResource($variant->load(['color', 'size']));
    }

    private function revalidateCatalog(): void
    {
        $this->storefrontRevalidation->revalidate([
            StorefrontRevalidationService::PRODUCTS,
            StorefrontRevalidationService::COLLECTIONS,
        ]);
    }

    private function mediaFileName(string $prefix, string $extension): string
    {
        return Str::slug($prefix) . '-' . Str::uuid() . '.' . strtolower($extension);
    }
}
