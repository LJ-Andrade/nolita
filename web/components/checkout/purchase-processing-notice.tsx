"use client";

import { CheckIcon } from "@heroicons/react/24/outline";

type PurchaseProcessingNoticeProps = {
  isComplete: boolean;
  processingTitle: string;
  completeTitle: string;
  completeMessage: string;
  orderId?: string;
};

function HtmlText({
  as: Component,
  html,
  className,
}: {
  as: "h2" | "p";
  html: string;
  className: string;
}) {
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function PurchaseProcessingNotice({
  isComplete,
  processingTitle,
  completeTitle,
  completeMessage,
  orderId,
}: PurchaseProcessingNoticeProps) {
  return (
    <div className="w-full max-w-md bg-transparent p-6">
      <div className="flex min-h-36 flex-col items-center justify-center gap-5 text-center">
        <HtmlText
          as="h2"
          html={isComplete ? completeTitle : processingTitle}
          className="font-serif text-2xl font-medium text-graphite transition-all duration-500 ease-out"
        />

        <div
          className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-stone-300 ${
            isComplete
              ? "animate-purchase-check-pop shadow-[0_18px_38px_-16px_rgba(0,219,115,0.6)]"
              : ""
          }`}
        >
          <span
            aria-hidden="true"
            className="animate-purchase-liquid-fill absolute inset-x-0 bottom-0"
          >
            <svg
              aria-hidden="true"
              className="animate-purchase-liquid-wave-a absolute -top-[6px] left-0 h-3 w-[200%]"
              viewBox="0 0 120 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0,5 Q15,0 30,5 T60,5 T90,5 T120,5 L120,10 L0,10 Z"
                fill="#00db73"
              />
            </svg>
            <svg
              aria-hidden="true"
              className="animate-purchase-liquid-wave-b absolute -top-[4px] left-0 h-3 w-[200%] opacity-60"
              viewBox="0 0 120 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0,5 Q15,10 30,5 T60,5 T90,5 T120,5 L120,10 L0,10 Z"
                fill="#00db73"
              />
            </svg>
          </span>
          <CheckIcon
            className="relative z-10 h-10 w-10 text-white"
            aria-hidden="true"
          />
        </div>

        <HtmlText
          as="p"
          html={completeMessage}
          className={`text-sm font-thin text-stone-brown transition-opacity duration-500 ${
            isComplete ? "opacity-100" : "opacity-0"
          }`}
        />

        {orderId ? (
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] text-graphite transition-opacity duration-500 ${
              isComplete ? "opacity-100" : "opacity-0"
            }`}
          >
            Número de pedido #{orderId}
          </p>
        ) : null}
      </div>
    </div>
  );
}
