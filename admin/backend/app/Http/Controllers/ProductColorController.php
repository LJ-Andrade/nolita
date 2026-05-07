<?php

namespace App\Http\Controllers;

use App\Models\ProductColor;
use App\Http\Resources\ProductColorResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Services\StorefrontRevalidationService;

class ProductColorController extends Controller
{
    public function __construct(private StorefrontRevalidationService $storefrontRevalidation)
    {
    }

    public function index(Request $request)
    {
        $query = ProductColor::query();

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
            return ProductColorResource::collection($query->get());
        }

        return ProductColorResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'hex_color' => 'required|string|max:7|regex:/^#[a-fA-F0-9]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $color = ProductColor::create($validator->validated());

        $this->revalidateCatalog();

        return new ProductColorResource($color);
    }

    public function show(ProductColor $productColor)
    {
        return new ProductColorResource($productColor);
    }

    public function update(Request $request, ProductColor $productColor)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'hex_color' => 'required|string|max:7|regex:/^#[a-fA-F0-9]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $productColor->update($validator->validated());

        $this->revalidateCatalog();

        return new ProductColorResource($productColor);
    }

    public function destroy(ProductColor $productColor)
    {
        $productColor->delete();

        $this->revalidateCatalog();

        return response()->json(['message' => 'Color deleted successfully']);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:product_colors,id',
        ]);

        $ids = $validated['ids'];
        $count = 0;

        DB::transaction(function () use ($ids, &$count) {
            foreach ($ids as $id) {
                $color = ProductColor::find($id);
                if ($color) {
                    $color->delete();
                    $count++;
                }
            }
        });

        $this->revalidateCatalog();

        return response()->json([
            'message' => $count . ' colors deleted successfully',
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
