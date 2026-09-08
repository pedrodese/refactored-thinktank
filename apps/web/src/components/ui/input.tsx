import * as React from "react"

import { cn } from "@/lib/cn"

// Diverges from the shadcn default: 44px tall below the sm breakpoint for the
// touch-target floor, and a full-strength focus outline. The control's boundary
// is --input rather than --border because a field's edge is the one boundary
// WCAG 1.4.11 requires 3:1 of; see DESIGN.md.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 max-sm:h-11 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
