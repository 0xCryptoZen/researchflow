import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[13px] font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/30",
  {
    variants: {
      variant: {
        default: 
          "bg-gradient-to-r from-[#5E6AD2] to-[#7C3AED] text-white " +
          "hover:opacity-90 hover:shadow-lg hover:shadow-[rgba(94,106,210,0.25)] " +
          "hover:-translate-y-0.5 active:translate-y-0 btn-hover-lift btn-hover-glow",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 hover:shadow-lg hover:shadow-[rgba(244,63,94,0.25)] hover:-translate-y-0.5",
        outline:
          "border border-[rgba(255,255,255,0.08)] bg-transparent " +
          "hover:bg-[#27272A] hover:border-[rgba(255,255,255,0.12)] " +
          "hover:text-[#EDEDEF] text-[#A1A1AA] btn-hover-lift",
        secondary:
          "bg-[#27272A] text-[#EDEDEF] hover:bg-[#3F3F46] " +
          "border border-[rgba(255,255,255,0.06)] " +
          "btn-hover-lift",
        ghost:
          "hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#EDEDEF] " +
          "btn-hover-lift",
        link: "text-[#5E6AD2] underline-offset-4 hover:underline",
        
        // 新增变体
        gradient:
          "bg-gradient-to-r from-[#5E6AD2] via-[#7C3AED] to-[#A855F7] text-white " +
          "bg-[length:200%_100%] hover:bg-[length:100%_100%] " +
          "hover:shadow-lg hover:shadow-[rgba(94,106,210,0.3)] " +
          "hover:-translate-y-0.5 btn-hover-lift transition-all duration-300",
        glass:
          "glass border border-[rgba(255,255,255,0.1)] text-[#EDEDEF] " +
          "hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] " +
          "btn-hover-lift",
        subtle:
          "bg-[rgba(94,106,210,0.1)] text-[#A5B4FC] " +
          "hover:bg-[rgba(94,106,210,0.2)] " +
          "btn-hover-lift",
      },
      size: {
        default: "h-8 px-3.5 py-1.5 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-[11px] has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 rounded-md gap-1.5 px-2.5 text-[12px] has-[>svg]:px-2",
        lg: "h-10 rounded-lg px-5 py-2 text-sm has-[>svg]:px-3.5",
        xl: "h-11 rounded-lg px-6 py-2.5 text-sm has-[>svg]:px-4",
        icon: "size-8 rounded-lg",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
