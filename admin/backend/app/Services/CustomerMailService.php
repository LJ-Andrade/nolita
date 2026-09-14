<?php

declare(strict_types=1);

namespace App\Services;

use App\Mail\OrderPurchased;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentMethod;
use App\Models\SiteContent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

final class CustomerMailService
{
    /**
     * Queue the purchase email for a placed order. Never throws: a mail problem must not fail checkout.
     */
    public function queueOrderPurchased(Order $order): bool
    {
        try {
            $recipient = $this->orderRecipient($order);

            if ($recipient === null) {
                Log::warning('Purchase email skipped: order has no valid email.', ['order_id' => $order->id]);

                return false;
            }

            $delivery = $this->deliveryRecipient($recipient);
            Mail::to($delivery)->queue((new OrderPurchased($this->orderPurchasedData($order)))->afterCommit());

            Log::info('Purchase email queued.', [
                'order_id' => $order->id,
                'test_redirected' => $delivery !== $recipient,
            ]);

            return true;
        } catch (Throwable $exception) {
            Log::error('Purchase email could not be queued.', [
                'order_id' => $order->id,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send the purchase email immediately to an explicit address (template previews).
     */
    public function sendOrderPurchasedPreview(Order $order, string $recipient): void
    {
        Mail::to($recipient)->send(new OrderPurchased($this->orderPurchasedData($order)));
    }

    /**
     * @return array<string, mixed>
     */
    public function orderPurchasedData(Order $order): array
    {
        $order->loadMissing('items');

        $customer = $order->customerSnapshot();
        $shipping = is_array($order->shipping_address) ? $order->shipping_address : [];
        $billing = is_array($order->billing_address) ? $order->billing_address : [];

        $items = $order->items->map(static fn (OrderItem $item): array => [
            'name' => $item->product_name,
            'variant' => $item->variant_label,
            'quantity' => (int) $item->quantity,
            'unit_price' => (float) $item->unit_price,
            'subtotal' => (float) $item->subtotal,
        ])->values()->all();

        return array_merge($this->commonData(), [
            'first_name' => $this->firstName($customer['name'] ?? null),
            'order_number' => (string) $order->id,
            'created_at' => $order->created_at
                ?->copy()
                ->setTimezone((string) config('customer_mail.timezone'))
                ->format('d/m/Y H:i'),
            'currency' => $order->currency ?: 'ARS',
            'items' => $items,
            'subtotal' => (float) collect($items)->sum('subtotal'),
            'coupon_code' => $order->coupon_code,
            'coupon_discount' => (float) ($order->coupon_discount_amount ?? 0),
            'delivery_fee' => (float) ($shipping['delivery_fee'] ?? 0),
            'payment_fee' => (float) ($billing['payment_fee'] ?? 0),
            'total' => (float) $order->total_amount,
            'delivery' => [
                'name' => $customer['name'] ?? null,
                'address' => $customer['address'] ?? null,
                'locality' => $customer['locality'] ?? $customer['city'] ?? null,
                'province' => $customer['province'] ?? null,
                'postal_code' => $customer['postal_code'] ?? null,
                'phone' => $customer['phone'] ?? $customer['whatsapp'] ?? null,
                'method' => $shipping['delivery_method_name'] ?? null,
            ],
            'payment' => array_merge(
                ['method' => $billing['payment_method_name'] ?? null],
                $this->richTextVersions($this->paymentDescription($billing)),
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function commonData(): array
    {
        $business = [];

        try {
            $business = SiteContent::getBusinessInfo();
        } catch (Throwable $exception) {
            Log::warning('Customer email business content could not be loaded.', ['error' => $exception->getMessage()]);
        }

        $storefrontUrl = rtrim((string) config('customer_mail.storefront_url'), '/');

        return [
            'brand_name' => (string) config('customer_mail.brand_name'),
            'storefront_url' => $storefrontUrl,
            'logo_url' => $storefrontUrl.config('customer_mail.logo_path'),
            'support_email' => $this->validEmail($business['business_email'] ?? null),
            'whatsapp_url' => $this->whatsappUrl($business['business_whatsapp'] ?? null),
        ];
    }

    private function paymentDescription(array $billing): ?string
    {
        $description = trim((string) ($billing['payment_method_description'] ?? ''));

        // Orders placed before the description snapshot existed fall back to the configured method.
        if ($description === '' && ! empty($billing['payment_method_id'])) {
            $description = trim((string) PaymentMethod::query()->whereKey($billing['payment_method_id'])->value('description'));
        }

        return $description !== '' ? $description : null;
    }

    private const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a'];

    /**
     * Rich text from the admin editor as email-safe HTML (allowlisted tags, only safe links) and plain text.
     *
     * @return array{description_html: ?string, description_text: ?string}
     */
    private function richTextVersions(?string $html): array
    {
        $html = trim((string) $html);

        if ($html === '') {
            return ['description_html' => null, 'description_text' => null];
        }

        $document = new \DOMDocument();
        libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="utf-8"?><div>'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $root = $document->getElementsByTagName('div')->item(0);
        if ($root === null) {
            return ['description_html' => null, 'description_text' => null];
        }

        $this->sanitizeNode($root);

        $safeHtml = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $safeHtml .= $document->saveHTML($child);
        }

        $text = html_entity_decode(strip_tags((string) preg_replace('/<(br|\/p|\/li)\s*\/?>/i', "\n", $safeHtml)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = trim((string) preg_replace("/\n{3,}/", "\n\n", (string) preg_replace('/[ \t]+/', ' ', $text)));

        return [
            'description_html' => trim($safeHtml) !== '' ? trim($safeHtml) : null,
            'description_text' => $text !== '' ? $text : null,
        ];
    }

    private function sanitizeNode(\DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof \DOMElement) {
                $tag = strtolower($child->tagName);

                if (in_array($tag, ['script', 'style', 'iframe', 'object'], true)) {
                    $node->removeChild($child);

                    continue;
                }

                $this->sanitizeNode($child);

                if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                    // Keep the text of unknown wrappers, drop the element itself.
                    while ($child->firstChild) {
                        $node->insertBefore($child->firstChild, $child);
                    }
                    $node->removeChild($child);

                    continue;
                }

                $href = $tag === 'a' ? trim($child->getAttribute('href')) : '';
                foreach (iterator_to_array($child->attributes) as $attribute) {
                    $child->removeAttribute($attribute->nodeName);
                }

                if (in_array($tag, ['p', 'ul', 'ol'], true)) {
                    $child->setAttribute('style', 'margin: 0 0 8px;');
                }

                if ($tag === 'a' && preg_match('#^(https?://|mailto:)#i', $href)) {
                    $child->setAttribute('href', $href);
                    $child->setAttribute('style', 'color: #2F2922; text-decoration: underline;');
                }
            } elseif ($child instanceof \DOMComment) {
                $node->removeChild($child);
            }
        }
    }

    private function orderRecipient(Order $order): ?string
    {
        return $this->validEmail($order->customerSnapshot()['email'] ?? null);
    }

    private function deliveryRecipient(string $recipient): string
    {
        $testRecipient = $this->validEmail(config('customer_mail.test_recipient'));

        if (! app()->environment('production') && $testRecipient !== null) {
            return $testRecipient;
        }

        return $recipient;
    }

    private function firstName(mixed $name): ?string
    {
        $name = trim((string) $name);

        return $name === '' ? null : explode(' ', $name)[0];
    }

    private function validEmail(mixed $email): ?string
    {
        if (! is_string($email)) {
            return null;
        }

        $email = trim($email);

        return filter_var($email, FILTER_VALIDATE_EMAIL) === false ? null : $email;
    }

    private function whatsappUrl(mixed $number): ?string
    {
        if (! is_string($number)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $number);

        return is_string($digits) && $digits !== '' ? 'https://wa.me/'.$digits : null;
    }
}
