<?php

namespace App\Http\Controllers;

use App\Models\ProductTag;
use App\Http\Resources\ProductTagResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Services\StorefrontRevalidationService;

class ProductTagController extends Controller
{
    public function __construct(private StorefrontRevalidationService $storefrontRevalidation)
    {
    }

    public function publicIndex(Request $request)
    {
        $query = ProductTag::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->input('search')}%");
        }

        return ProductTagResource::collection($query->orderBy('name')->get());
    }

    public function index(Request $request)
    {
        $query = ProductTag::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        // Advanced filters
        if ($request->filled('filter_id')) {
            $query->where('id', $request->filter_id);
        }

        if ($request->filled('filter_name')) {
            $query->where('name', 'like', '%' . $request->filter_name . '%');
        }

        $sortBy = $request->input('sort_by', 'id');
        $sortDir = $request->input('sort_dir', 'desc');

        if (in_array($sortBy, ['id', 'name', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        if ($request->boolean('all')) {
            return ProductTagResource::collection($query->get());
        }

        return ProductTagResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_tags,slug',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (ProductTag::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $tag = ProductTag::create($data);

        $this->revalidateCatalog();

        return new ProductTagResource($tag);
    }

    public function show(ProductTag $product_tag)
    {
        return new ProductTagResource($product_tag);
    }

    public function update(Request $request, ProductTag $product_tag)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_tags,slug,' . $product_tag->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (ProductTag::where('slug', $data['slug'])->where('id', '!=', $product_tag->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $product_tag->update($data);

        $this->revalidateCatalog();

        return new ProductTagResource($product_tag);
    }

    public function destroy(ProductTag $product_tag)
    {
        $product_tag->delete();

        $this->revalidateCatalog();

        return response()->noContent();
    }

    /**
     * Remove multiple tags from storage.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:product_tags,id',
        ]);

        $ids = $validated['ids'];
        $count = 0;

        DB::transaction(function () use ($ids, &$count) {
            foreach ($ids as $id) {
                $tag = ProductTag::find($id);
                if ($tag) {
                    $tag->delete();
                    $count++;
                }
            }
        });

        $this->revalidateCatalog();

        return response()->json([
            'message' => $count . ' tags deleted successfully',
            'deleted_count' => $count,
        ]);
    }

    private function revalidateCatalog(): void
    {
        $this->storefrontRevalidation->revalidate([
            StorefrontRevalidationService::PRODUCTS,
            StorefrontRevalidationService::COLLECTIONS,
        ]);
    }
}
