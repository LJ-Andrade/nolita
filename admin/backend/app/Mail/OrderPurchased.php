<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Purchase confirmation sent to the buyer when storefront checkout completes.
 * Carries a plain data array built from the order snapshot, so queued delivery
 * never re-reads live order, product, or customer records.
 */
final class OrderPurchased extends Mailable implements ShouldQueue
{
    use Queueable;

    public const SUBJECT = 'Gracias por comprar en Nolita';

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(public readonly array $data) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: self::SUBJECT);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.customer.order-purchased',
            text: 'emails.customer.text.order-purchased',
            with: ['data' => $this->data],
        );
    }
}
