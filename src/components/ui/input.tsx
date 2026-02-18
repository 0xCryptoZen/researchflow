import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#71717A] selection:bg-primary selection:text-primary-foreground",
        "h-9 w-full min-w-0 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#18181B] px-3 py-1.5 text-[13px] text-[#EDEDEF] transition-all duration-150",
        "placeholder:text-[#71717A]",
        "focus:outline-none focus:border-[rgba(94,106,210,0.5)] focus:ring-2 focus:ring-[rgba(94,106,210,0.15)] focus:bg-[#1A1A1E]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
