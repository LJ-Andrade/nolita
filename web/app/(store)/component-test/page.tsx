import PurchaseAnimationTest from "components/checkout/purchase-animation-test";

export const metadata = {
  title: "UI/UX Tests",
  description: "Component testing page.",
};

export default function ComponentTestPage() {
  return (
    <div className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-medium text-graphite">
        UI/UX Tests
      </h1>
      <PurchaseAnimationTest />
    </div>
  );
}
