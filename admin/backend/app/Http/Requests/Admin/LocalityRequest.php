<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class LocalityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'name' => $isUpdate ? 'sometimes|string|max:255' : 'required|string|max:255',
            'province_id' => $isUpdate ? 'sometimes|exists:provinces,id' : 'required|exists:provinces,id',
            'cost' => 'nullable|numeric|min:0',
        ];
    }
}