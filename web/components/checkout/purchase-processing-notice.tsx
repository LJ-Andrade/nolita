"use client";

import { CheckIcon } from "@heroicons/react/24/outline";

type PurchaseProcessingNoticeProps = {
  isComplete: boolean;
  processingTitle: string;
  completeTitle: string;
  completeMessage: string;
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
}: PurchaseProcessingNoticeProps) {
  return (
    <div className="w-full max-w-md bg-transparent p-6">
      <div className="flex min-h-36 flex-col items-center justify-center gap-5 text-center">
        <div className="transition-all duration-500 ease-out">
          <HtmlText
            as="h2"
            html={isComplete ? completeTitle : processingTitle}
            className="font-serif text-2xl font-medium text-graphite"
          />
          {isComplete && (
            <HtmlText
              as="p"
              html={completeMessage}
              className="mt-2 text-sm font-thin text-stone-brown"
            />
          )}
        </div>

        {isComplete ? (
          <div className="relative flex h-24 w-24 items-center justify-center">
            <span className="purchase-confetti purchase-confetti-1" />
            <span className="purchase-confetti purchase-confetti-2" />
            <span className="purchase-confetti purchase-confetti-3" />
            <span className="purchase-confetti purchase-confetti-4" />
            <span className="purchase-confetti purchase-confetti-5" />
            <span className="purchase-confetti purchase-confetti-6" />
            <span className="purchase-confetti purchase-confetti-7" />
            <span className="purchase-confetti purchase-confetti-8" />

            <span className="animate-purchase-check-bounce relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-[0_18px_38px_-16px_rgba(22,163,74,0.95)]">
              <CheckIcon className="h-8 w-8" aria-hidden="true" />
            </span>
          </div>
        ) : (
          <div className="h-2 w-full overflow-hidden rounded-full bg-bone transition-opacity duration-300">
            <div className="h-full rounded-full bg-graphite animate-purchase-progress" />
          </div>
        )}
      </div>
    </div>
  );
}
