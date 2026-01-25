import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base transition-[color,box-shadow] outline-none md:text-sm",
        "bg-[rgba(15,23,42,0.6)] border-[rgba(100,150,255,0.15)] text-zinc-100",
        "placeholder:text-zinc-500 backdrop-blur-sm",
        "focus-visible:border-[rgba(58,111,248,0.5)] focus-visible:ring-[rgba(58,111,248,0.2)] focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
