"use client";

import PurchaseProcessingNotice from "components/checkout/purchase-processing-notice";
import { useEffect, useState } from "react";
import webTexts from "../../web-texts.json";

const ANIMATION_DURATION = 2600;
const checkoutTexts = webTexts.checkoutProcessingNotice;

export default function PurchaseAnimationTest() {
  const [runId, setRunId] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const timeout = window.setTimeout(() => {
      setIsComplete(true);
      setIsRunning(false);
    }, ANIMATION_DURATION);

    return () => window.clearTimeout(timeout);
  }, [isRunning, runId]);

  const startAnimation = () => {
    setIsComplete(false);
    setIsRunning(true);
    setRunId((currentRunId) => currentRunId + 1);
  };

  return (
    <div className="mt-10 flex w-full max-w-2xl flex-col gap-8">
      <button
        type="button"
        onClick={startAnimation}
        className="w-fit rounded-[12px] bg-graphite px-5 py-4 text-sm font-bold uppercase tracking-widest text-parchment transition-opacity hover:opacity-90"
      >
        {checkoutTexts.testButtonLabel}
      </button>

      {(isRunning || isComplete) && (
        <PurchaseProcessingNotice
          key={runId}
          isComplete={isComplete}
          processingTitle={checkoutTexts.processingTitle}
          completeTitle={checkoutTexts.completeTitle}
          completeMessage={checkoutTexts.completeMessage}
        />
      )}
    </div>
  );
}
