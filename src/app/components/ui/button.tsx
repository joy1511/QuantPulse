import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-[#3A6FF8] text-white hover:bg-[#4A7AE8] shadow-sm shadow-blue-500/20",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-[rgba(100,150,255,0.25)] bg-transparent text-zinc-200 hover:bg-[rgba(58,111,248,0.15)] hover:border-[rgba(100,150,255,0.4)]",
        secondary:
          "bg-[rgba(15,23,42,0.6)] text-zinc-200 border border-[rgba(100,150,255,0.12)] hover:bg-[rgba(15,23,42,0.8)]",
        ghost:
          "hover:bg-[rgba(58,111,248,0.1)] hover:text-zinc-100",
        link: "text-[#5B8DFF] underline-offset-4 hover:underline",
        fintech: "bg-transparent border border-[#3A6FF8]/40 text-[#5B8DFF] hover:bg-[#3A6FF8]/10 hover:border-[#3A6FF8]/60",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
