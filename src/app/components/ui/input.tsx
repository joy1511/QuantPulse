import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none md:text-sm",
        "bg-[rgba(15,23,42,0.6)] border-[rgba(100,150,255,0.15)] text-zinc-100",
        "placeholder:text-zinc-500 backdrop-blur-sm",
        "focus-visible:border-[rgba(58,111,248,0.5)] focus-visible:ring-[rgba(58,111,248,0.2)] focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-zinc-300 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
