<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use App\Http\Resources\NewsletterSubscriberResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class NewsletterSubscriberController extends Controller
{
    public function index(Request $request)
    {
        $query = NewsletterSubscriber::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('customer_type')) {
            $query->where('customer_type', $request->input('customer_type'));
        }

        $sortBy = $request->input('sort_by', 'id');
        $sortDir = $request->input('sort_dir', 'desc');

        if (in_array($sortBy, ['id', 'name', 'email', 'customer_type', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        if ($request->boolean('all')) {
            return NewsletterSubscriberResource::collection($query->get());
        }

        return NewsletterSubscriberResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:newsletter_subscribers,email',
            'customer_type' => 'nullable|in:minorista,mayorista',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subscriber = NewsletterSubscriber::create($validator->validated());

        return new NewsletterSubscriberResource($subscriber);
    }

    public function show(NewsletterSubscriber $newsletterSubscriber)
    {
        return new NewsletterSubscriberResource($newsletterSubscriber);
    }

    public function update(Request $request, NewsletterSubscriber $newsletterSubscriber)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:newsletter_subscribers,email,' . $newsletterSubscriber->id,
            'customer_type' => 'nullable|in:minorista,mayorista',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $newsletterSubscriber->update($validator->validated());

        return new NewsletterSubscriberResource($newsletterSubscriber);
    }

    public function destroy(NewsletterSubscriber $newsletterSubscriber)
    {
        $newsletterSubscriber->delete();

        return response()->json(['message' => 'Subscriber deleted successfully']);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:newsletter_subscribers,id',
        ]);

        $ids = $validated['ids'];
        $count = 0;

        DB::transaction(function () use ($ids, &$count) {
            foreach ($ids as $id) {
                $subscriber = NewsletterSubscriber::find($id);
                if ($subscriber) {
                    $subscriber->delete();
                    $count++;
                }
            }
        });

        return response()->json([
            'message' => $count . ' subscribers deleted successfully',
            'deleted_count' => $count,
        ]);
    }

    /**
     * Public endpoint used by the storefront popup to register a subscriber.
     */
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'customer_type' => 'required|in:minorista,mayorista',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $subscriber = NewsletterSubscriber::updateOrCreate(
            ['email' => $data['email']],
            [
                'name' => $data['name'],
                'customer_type' => $data['customer_type'],
            ]
        );

        return response()->json([
            'data' => new NewsletterSubscriberResource($subscriber),
        ], $subscriber->wasRecentlyCreated ? 201 : 200);
    }
}
