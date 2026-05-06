<?php

namespace App\Http\Controllers;

use App\Http\Resources\SystemSettingResource;
use App\Models\SiteContent;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SystemSettingsController extends Controller
{
    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return SystemSettingResource::collection(SystemSetting::all());
    }

    public function publicInfo(): JsonResponse
    {
        return response()->json(['data' => SiteContent::getBusinessInfo()]);
    }

    public function show(string $key): JsonResponse
    {
        $setting = SystemSetting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        return response()->json(['data' => new SystemSettingResource($setting)]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $setting = SystemSetting::set($key, $validated['value'] ?? null, $validated['description'] ?? null);

        return response()->json(['data' => new SystemSettingResource($setting)]);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable|string',
        ]);

        $updated = [];
        foreach ($validated['settings'] as $key => $value) {
            $setting = SystemSetting::set($key, $value);
            $updated[] = new SystemSettingResource($setting);
        }

        return response()->json(['data' => $updated]);
    }
}
