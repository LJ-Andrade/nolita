<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

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
        
        return [
            'name' => 'required|string|max:255',
            'dni' => 'required|string|size:8|regex:/^[0-9]+$/|unique:customers,dni,' . $customerId,
            'email' => 'required|email|unique:customers,email,' . $customerId,
            'password' => $customerId ? 'nullable|string|min:8' : 'required|string|min:8',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'postal_code' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'logo' => 'nullable|image|max:2048',
        ];
    }
}
