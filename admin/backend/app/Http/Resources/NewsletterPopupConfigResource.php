<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsletterPopupConfigResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'is_enabled' => $this->is_enabled,
            'delay_seconds' => $this->delay_seconds,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'name_label' => $this->name_label,
            'name_placeholder' => $this->name_placeholder,
            'email_label' => $this->email_label,
            'email_placeholder' => $this->email_placeholder,
            'customer_type_text' => $this->customer_type_text,
            'submit_text' => $this->submit_text,
            'dismiss_text' => $this->dismiss_text,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
