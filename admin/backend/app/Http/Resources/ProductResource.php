<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'slug' => $this->slug,
            'description' => $this->description,
            'cost_price' => $this->cost_price,
            'sale_price' => $this->sale_price,
            'status' => $this->status,
            'featured' => $this->featured,
            'hide_on_wholesale' => $this->hide_on_wholesale,
            'order' => $this->order,
            'qr_url' => $this->qr_url,
            'category_id' => $this->category_id,
            'wholesale_price' => $this->wholesale_price,
            'discount' => $this->discount,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'author' => new UserResource($this->whenLoaded('author')),
            'category' => new ProductCategoryResource($this->whenLoaded('category')),
            'tags' => ProductTagResource::collection($this->whenLoaded('tags')),
            'sizes' => ProductSizeResource::collection($this->whenLoaded('sizes')),
            'colors' => ProductColorResource::collection($this->whenLoaded('colors')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'cover_url' => $this->firstExistingMediaUrl('cover'),
            'gallery' => $this->loadMedia('gallery')
                ->filter(fn (Media $media): bool => $this->mediaExists($media))
                ->sortBy('order_column')
                ->values()
                ->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'url' => $media->getUrl(),
                        'order' => $media->order_column,
                    ];
                }),
            'document_url' => $this->firstExistingMediaUrl('document'),
            'color_images' => $this->loadMedia('color_images')
                ->filter(fn (Media $media): bool => $this->mediaExists($media))
                ->values()
                ->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'color_id' => $media->getCustomProperty('color_id'),
                        'image_url' => $media->getUrl(),
                    ];
                }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function firstExistingMediaUrl(string $collection): ?string
    {
        $media = $this->getMedia($collection)
            ->first(fn (Media $media): bool => $this->mediaExists($media));

        return $media?->getUrl();
    }

    private function mediaExists(Media $media): bool
    {
        return Storage::disk($media->disk)->exists($media->getPathRelativeToRoot());
    }
}
