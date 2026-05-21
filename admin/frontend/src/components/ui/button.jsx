import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[var(--admin-button-radius)] text-sm font-medium ring-offset-background transition-[background-color,border-color,box-shadow,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-[length:var(--admin-button-border-width)] border-[color:var(--admin-button-border)] bg-[color:var(--admin-button-default-bg)] text-[color:var(--admin-button-default-text)] shadow-[var(--admin-button-shadow)] hover:bg-[color:var(--admin-button-default-bg-hover)] hover:shadow-[var(--admin-button-shadow-hover)] active:shadow-[var(--admin-button-shadow-pressed)]",
        destructive:
          "border-[length:var(--admin-button-border-width)] border-[color:var(--admin-button-border)] bg-[color:var(--admin-button-destructive-bg)] text-[color:var(--admin-button-destructive-text)] shadow-[var(--admin-button-shadow)] hover:bg-[color:var(--admin-button-destructive-bg-hover)] hover:shadow-[var(--admin-button-shadow-hover)] active:shadow-[var(--admin-button-shadow-pressed)]",
        outline:
          "border-[length:var(--admin-button-border-width)] border-[color:var(--admin-button-border)] bg-[color:var(--admin-button-outline-bg)] text-[color:var(--admin-button-outline-text)] shadow-[var(--admin-button-muted-shadow)] hover:bg-[color:var(--admin-button-outline-bg-hover)] hover:text-[color:var(--admin-button-outline-text-hover)] hover:shadow-[var(--admin-button-muted-shadow-hover)] active:shadow-[var(--admin-button-muted-shadow-pressed)]",
        secondary:
          "border-[length:var(--admin-button-border-width)] border-[color:var(--admin-button-border)] bg-[color:var(--admin-button-secondary-bg)] text-[color:var(--admin-button-secondary-text)] shadow-[var(--admin-button-muted-shadow)] hover:bg-[color:var(--admin-button-secondary-bg-hover)] hover:shadow-[var(--admin-button-muted-shadow-hover)] active:shadow-[var(--admin-button-muted-shadow-pressed)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-4 py-4",
        sm: "h-7 rounded-[var(--admin-button-radius)] px-3 py-4",
        lg: "h-8 rounded-[var(--admin-button-radius)] px-5 py-4",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
