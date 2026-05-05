<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $customerId = $this->route('customer') ? $this->route('customer')->id : null;
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'name' => $isUpdate ? 'sometimes|string|max:255' : 'required|string|max:255',
            'dni' => [
                Rule::excludeIf($isUpdate && !$this->filled('dni')),
                'nullable',
                'string',
                'size:8',
                'regex:/^[0-9]+$/',
                Rule::unique('customers', 'dni')->ignore($customerId),
            ],
            'email' => $isUpdate 
                ? 'sometimes|email|unique:customers,email,' . $customerId 
                : 'required|email|unique:customers,email,' . $customerId,
            'password' => $customerId ? 'nullable|string|min:8' : 'required|string|min:8',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'postal_code' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'province_id' => 'nullable|exists:provinces,id',
            'locality_id' => 'nullable|exists:localities,id',
            'logo' => 'nullable|image|max:2048',
        ];
    }
}
