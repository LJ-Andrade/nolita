import clsx from "clsx";

export function formatPriceAmount(amount: string): string {
  const numericAmount = Number.parseFloat(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  return `$ ${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount)}`;
}

const Price = ({
  amount,
  className,
  currencyCode = "$",
  currencyCodeClassName,
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<"p">) => (
  <p suppressHydrationWarning={true} className={className}>
    {formatPriceAmount(amount)}
    <span
      className={clsx("hidden", currencyCodeClassName)}
    >{`${currencyCode}`}</span>
  </p>
);

export default Price;
