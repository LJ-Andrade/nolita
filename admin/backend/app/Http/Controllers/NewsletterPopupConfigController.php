<?php

namespace App\Http\Controllers;

use App\Http\Resources\NewsletterPopupConfigResource;
use App\Models\NewsletterPopupConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\StorefrontRevalidationService;

class NewsletterPopupConfigController extends Controller
{
    public function __construct(private StorefrontRevalidationService $storefrontRevalidation)
    {
    }

    public function show(): JsonResponse
    {
        $config = NewsletterPopupConfig::getConfig();

        return response()->json(['data' => new NewsletterPopupConfigResource($config)]);
    }

    public function publicInfo(): JsonResponse
    {
        $config = NewsletterPopupConfig::getConfig();

        return response()->json(['data' => new NewsletterPopupConfigResource($config)]);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_enabled' => 'required|boolean',
            'delay_seconds' => 'required|integer|min:0',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string',
            'name_label' => 'nullable|string|max:255',
            'name_placeholder' => 'nullable|string|max:255',
            'email_label' => 'nullable|string|max:255',
            'email_placeholder' => 'nullable|string|max:255',
            'customer_type_text' => 'nullable|string',
            'submit_text' => 'nullable|string|max:255',
            'dismiss_text' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config = NewsletterPopupConfig::getConfig();
        $config->update($validator->validated());

        $this->storefrontRevalidation->revalidate([
            StorefrontRevalidationService::NEWSLETTER,
        ]);

        return response()->json(['data' => new NewsletterPopupConfigResource($config->fresh())]);
    }
}
