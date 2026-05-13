<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    private const LOW_STOCK_THRESHOLD = 50;

    public function favorites(Request $request): JsonResponse
    {
        $this->authorizeStatisticsAccess($request);

        $categoryId = $request->integer('category_id') ?: null;
        $favoriteRecords = DB::table('customer_favorites')
            ->join('products', 'products.id', '=', 'customer_favorites.product_id')
            ->when($categoryId, fn ($query) => $query->where('products.category_id', $categoryId));

        $summary = [
            'total_favorites' => (clone $favoriteRecords)->count(),
            'unique_products' => (clone $favoriteRecords)->distinct('customer_favorites.product_id')->count('customer_favorites.product_id'),
            'customers_with_favorites' => (clone $favoriteRecords)->distinct('customer_favorites.customer_id')->count('customer_favorites.customer_id'),
        ];

        $products = Product::query()
            ->with('category')
            ->withCount('favoritedBy')
            ->withSum('variants as stock_total', 'stock')
            ->has('favoritedBy')
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->orderByDesc('favorited_by_count')
            ->orderBy('name')
            ->limit(20)
            ->get()
            ->map(fn (Product $product): array => $this->favoriteProductPayload($product));

        return response()->json([
            'data' => [
                'summary' => $summary,
                'products' => $products,
                'opportunities' => $products
                    ->filter(fn (array $product): bool => $product['stock_total'] <= self::LOW_STOCK_THRESHOLD)
                    ->take(5)
                    ->values(),
                'categories' => $this->categoryOptions(),
            ],
        ]);
    }

    public function sales(Request $request): JsonResponse
    {
        $this->authorizeStatisticsAccess($request);

        $period = $this->resolveSalesPeriod($request->query('period'));
        $categoryId = $request->integer('category_id') ?: null;
        $cacheKey = "admin_statistics_sales:{$period}:category:" . ($categoryId ?: 'all');

        $data = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($period, $categoryId): array {
            return $this->buildSalesStatistics($period, $categoryId);
        });

        return response()->json(['data' => $data]);
    }

    private function authorizeStatisticsAccess(Request $request): void
    {
        abort_unless($request->user()?->hasAnyRole(['Super Admin', 'Admin']), 403);
    }

    private function buildSalesStatistics(string $period, ?int $categoryId): array
    {
        [$startDate, $endDate, $previousStartDate, $previousEndDate] = $this->getSalesPeriodRange($period);
        $summary = $this->salesSummary($startDate, $endDate, $categoryId);
        $previousSummary = $period === 'all'
            ? null
            : $this->salesSummary($previousStartDate, $previousEndDate, $categoryId);
        $products = $this->salesProducts($startDate, $endDate, $categoryId);

        return [
            'period' => $period,
            'summary' => $summary,
            'comparison' => $previousSummary ? $this->salesComparison($summary, $previousSummary) : null,
            'products' => $products,
            'opportunities' => $products
                ->filter(fn (array $product): bool => $product['stock_total'] <= self::LOW_STOCK_THRESHOLD)
                ->take(5)
                ->values(),
            'categories' => $this->categoryOptions(),
        ];
    }

    private function salesSummary(?Carbon $startDate, ?Carbon $endDate, ?int $categoryId): array
    {
        $completedOrders = Order::query()
            ->where('status', 'completed')
            ->when($startDate, fn ($query) => $query->where('created_at', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->where('created_at', '<', $endDate))
            ->when($categoryId, fn ($query) => $query->whereHas('items.product', fn ($productQuery) => $productQuery->where('category_id', $categoryId)));

        $ordersCount = (clone $completedOrders)->count();
        if ($categoryId) {
            $categoryItems = DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'products.id', '=', 'order_items.product_id')
                ->where('orders.status', 'completed')
                ->where('products.category_id', $categoryId)
                ->when($startDate, fn ($query) => $query->where('orders.created_at', '>=', $startDate))
                ->when($endDate, fn ($query) => $query->where('orders.created_at', '<', $endDate));

            $totalRevenue = (float) (clone $categoryItems)->sum('order_items.subtotal');
            $unitsSold = (int) (clone $categoryItems)->sum('order_items.quantity');
        } else {
            $totalRevenue = (float) (clone $completedOrders)->sum('total_amount');
            $unitsSold = (int) OrderItem::query()
                ->whereHas('order', fn ($query) => $this->applyCompletedOrderPeriod($query, $startDate, $endDate))
                ->sum('quantity');
        }

        return [
            'total_revenue' => round($totalRevenue, 2),
            'orders_count' => $ordersCount,
            'average_order_value' => $ordersCount > 0 ? round($totalRevenue / $ordersCount, 2) : 0,
            'units_sold' => $unitsSold,
        ];
    }

    private function salesProducts(?Carbon $startDate, ?Carbon $endDate, ?int $categoryId): \Illuminate\Support\Collection
    {
        return OrderItem::query()
            ->select('order_items.product_id')
            ->selectRaw('MAX(order_items.product_name) as product_name')
            ->selectRaw('SUM(order_items.quantity) as units_sold')
            ->selectRaw('SUM(order_items.subtotal) as revenue')
            ->whereNotNull('order_items.product_id')
            ->whereHas('order', fn ($query) => $this->applyCompletedOrderPeriod($query, $startDate, $endDate))
            ->when($categoryId, fn ($query) => $query->whereHas('product', fn ($productQuery) => $productQuery->where('category_id', $categoryId)))
            ->with([
                'product.category',
                'product' => fn ($query) => $query->withSum('variants as stock_total', 'stock'),
            ])
            ->groupBy('order_items.product_id')
            ->orderByDesc('units_sold')
            ->orderByDesc('revenue')
            ->limit(20)
            ->get()
            ->map(fn (OrderItem $item): array => [
                'id' => $item->product_id,
                'name' => $item->product?->name ?? $item->product_name,
                'category' => $item->product?->category?->name,
                'status' => $item->product?->status,
                'stock_total' => (int) ($item->product?->stock_total ?? 0),
                'units_sold' => (int) $item->units_sold,
                'revenue' => round((float) $item->revenue, 2),
            ]);
    }

    private function applyCompletedOrderPeriod($query, ?Carbon $startDate, ?Carbon $endDate)
    {
        return $query
            ->where('status', 'completed')
            ->when($startDate, fn ($orderQuery) => $orderQuery->where('created_at', '>=', $startDate))
            ->when($endDate, fn ($orderQuery) => $orderQuery->where('created_at', '<', $endDate));
    }

    private function salesComparison(array $current, array $previous): array
    {
        return [
            'total_revenue' => $this->percentChange($current['total_revenue'], $previous['total_revenue']),
            'orders_count' => $this->percentChange($current['orders_count'], $previous['orders_count']),
            'average_order_value' => $this->percentChange($current['average_order_value'], $previous['average_order_value']),
            'units_sold' => $this->percentChange($current['units_sold'], $previous['units_sold']),
        ];
    }

    private function percentChange(float|int $current, float|int $previous): ?float
    {
        if ((float) $previous === 0.0) {
            return (float) $current === 0.0 ? 0.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function favoriteProductPayload(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'category' => $product->category?->name,
            'status' => $product->status,
            'stock_total' => (int) ($product->stock_total ?? 0),
            'favorites_count' => (int) $product->favorited_by_count,
        ];
    }

    private function resolveSalesPeriod(mixed $period): string
    {
        return in_array($period, ['7d', '30d', '90d', 'all'], true) ? $period : '30d';
    }

    private function getSalesPeriodRange(string $period): array
    {
        $endDate = now();

        return match ($period) {
            '7d' => [$endDate->copy()->subDays(7), $endDate, $endDate->copy()->subDays(14), $endDate->copy()->subDays(7)],
            '30d' => [$endDate->copy()->subDays(30), $endDate, $endDate->copy()->subDays(60), $endDate->copy()->subDays(30)],
            '90d' => [$endDate->copy()->subDays(90), $endDate, $endDate->copy()->subDays(180), $endDate->copy()->subDays(90)],
            default => [null, null, null, null],
        };
    }

    private function categoryOptions(): \Illuminate\Support\Collection
    {
        return ProductCategory::query()
            ->orderBy('order')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (ProductCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
            ]);
    }
}
