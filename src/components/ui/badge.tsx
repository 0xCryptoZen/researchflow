import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-[11px] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 transition-all duration-150",
  {
    variants: {
      variant: {
        default: "bg-[rgba(94,106,210,0.15)] text-[#A5B4FC] border-[rgba(94,106,210,0.2)]",
        secondary:
          "bg-[#27272A] text-[#A1A1AA] border-[rgba(255,255,255,0.06)]",
        destructive:
          "bg-[rgba(244,63,94,0.15)] text-[#FB7185] border-[rgba(244,63,94,0.2)]",
        outline:
          "border-[rgba(255,255,255,0.08)] text-[#A1A1AA] bg-transparent",
        success:
          "bg-[rgba(16,185,129,0.15)] text-[#34D399] border-[rgba(16,185,129,0.2)]",
        warning:
          "bg-[rgba(245,158,11,0.15)] text-[#FBBF24] border-[rgba(245,158,11,0.2)]",
        info:
          "bg-[rgba(59,130,246,0.15)] text-[#60A5FA] border-[rgba(59,130,246,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
