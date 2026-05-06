<?php

namespace App\Http\Controllers;

use App\Http\Resources\ShopConfigurationResource;
use App\Models\ShopConfiguration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShopConfigurationController extends Controller
{
    public function show(): JsonResponse
    {
        $config = ShopConfiguration::getConfig();

        return response()->json(['data' => new ShopConfigurationResource($config)]);
    }

    public function publicInfo(): JsonResponse
    {
        $config = ShopConfiguration::getConfig();

        return response()->json(['data' => new ShopConfigurationResource($config)]);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'min_quantity' => 'required|integer|min:0',
            'min_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config = ShopConfiguration::getConfig();
        $config->update($validator->validated());

        return response()->json(['data' => new ShopConfigurationResource($config->fresh())]);
    }
}
