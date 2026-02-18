import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-[rgba(255,255,255,0.08)] placeholder:text-[#52525B] focus-visible:border-[rgba(94,106,210,0.5)] focus-visible:ring-2 focus-visible:ring-[rgba(94,106,210,0.15)] aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-lg border bg-[#18181B] px-3 py-2 text-[13px] text-[#EDEDEF] transition-all duration-150 outline-none focus-visible:bg-[#1A1A1E] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
