<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Http\Resources\CouponResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $query = Coupon::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('code', 'like', "%{$search}%");
        }

        if ($request->filled('filter_id')) {
            $query->where('id', $request->filter_id);
        }

        if ($request->filled('filter_code')) {
            $query->where('code', 'like', '%' . $request->filter_code . '%');
        }

        if ($request->filled('filter_discount_type')) {
            $query->where('discount_type', $request->filter_discount_type);
        }

        if ($request->filled('filter_active')) {
            $query->where('active', $request->boolean('filter_active'));
        }

        if ($request->filled('filter_price_mode_scope')) {
            $query->where('price_mode_scope', $request->filter_price_mode_scope);
        }

        $sortBy = $request->input('sort_by', 'id');
        $sortDir = $request->input('sort_dir', 'desc');

        if (in_array($sortBy, ['id', 'code', 'discount_type', 'amount', 'expires_at', 'active', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        if ($request->boolean('all')) {
            return CouponResource::collection($query->get());
        }

        return CouponResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:coupons,code',
            'discount_type' => 'required|string|in:percentage,fixed',
            'amount' => 'required|numeric|min:0',
            'expires_at' => 'nullable|date',
            'active' => 'boolean',
            'price_mode_scope' => 'nullable|in:both,retail,wholesale',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if ($request->has('price_mode_scope')) {
            $data['price_mode_scope'] = $data['price_mode_scope'] ?? 'both';
        }
        
        // Debug: log all input
        \Log::info('=== BACKEND STORE: Request all ===', $request->all());
        \Log::info('=== BACKEND STORE: Validated data ===', $data);
        
        // Convert active to boolean
        if ($request->has('active')) {
            $data['active'] = $request->boolean('active');
        } else {
            $data['active'] = false; // Default for form submission without active checkbox
        }
        
        \Log::info('=== BACKEND STORE: Final data to create ===', $data);

        $coupon = Coupon::create($data);

        return new CouponResource($coupon);
    }

    public function show(Coupon $coupon)
    {
        return new CouponResource($coupon);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|string|max:255|unique:coupons,code,' . $coupon->id,
            'discount_type' => 'sometimes|string|in:percentage,fixed',
            'amount' => 'sometimes|numeric|min:0',
            'expires_at' => 'nullable|date',
            'active' => 'sometimes|boolean',
            'price_mode_scope' => 'nullable|in:both,retail,wholesale',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if ($request->has('price_mode_scope')) {
            $data['price_mode_scope'] = $data['price_mode_scope'] ?? 'both';
        }
        
        \Log::info('=== BACKEND UPDATE: Request all ===', $request->all());
        \Log::info('=== BACKEND UPDATE: Validated data ===', $data);
        
        if ($request->has('active')) {
            $data['active'] = $request->boolean('active');
        }
        
        \Log::info('=== BACKEND UPDATE: Final data to update ===', $data);

        $coupon->update($data);

        return new CouponResource($coupon);
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted successfully']);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:coupons,id',
        ]);

        $ids = $validated['ids'];
        $count = 0;

        DB::transaction(function () use ($ids, &$count) {
            foreach ($ids as $id) {
                $coupon = Coupon::find($id);
                if ($coupon) {
                    $coupon->delete();
                    $count++;
                }
            }
        });

        return response()->json([
            'message' => $count . ' coupons deleted successfully',
            'deleted_count' => $count,
        ]);
    }

    public function validateForCheckout(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'price_mode' => ['nullable', 'in:retail,wholesale'],
        ]);

        $coupon = Coupon::whereRaw('LOWER(code) = ?', [strtolower(trim($validated['code']))])->first();
        $priceMode = $validated['price_mode'] ?? 'retail';

        if (!$coupon || !$coupon->isValidForCheckout($priceMode)) {
            return response()->json([
                'message' => 'Cupón inválido o vencido',
            ], 404);
        }

        $subtotal = (float) $validated['subtotal'];
        $discountAmount = $coupon->discountForSubtotal($subtotal);

        return response()->json([
            'data' => [
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'amount' => (float) $coupon->amount,
                'discount_amount' => $discountAmount,
                'subtotal' => $subtotal,
                'total' => round($subtotal - $discountAmount, 2),
            ],
        ]);
    }
}
