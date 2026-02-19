import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ 
  className, 
  hoverable = true,
  glass = false,
  ...props 
}: React.ComponentProps<"div"> & {
  /** 是否启用悬浮效果 */
  hoverable?: boolean;
  /** 是否使用玻璃拟态 */
  glass?: boolean;
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        glass 
          ? "glass-card" 
          : "bg-card text-card-foreground flex flex-col gap-5 rounded-xl border border-[rgba(255,255,255,0.08)] py-5",
        hoverable && "transition-all duration-200 hover:border-[rgba(255,255,255,0.12)] hover:bg-[#1A1A1E] hover:shadow-lg hover:shadow-[rgba(0,0,0,0.2)]",
        glass && hoverable && "transition-all duration-200 hover:bg-[rgba(24,24,27,0.8)] hover:border-[rgba(255,255,255,0.12)] hover:shadow-xl",
        className
      )}
      {...props}
    />
  )
}

/**
 * 可交互的悬浮卡片 - 带发光效果
 */
function CardInteractive({ 
  className, 
  glowOnHover = false,
  ...props 
}: React.ComponentProps<"div"> & {
  /** 悬浮时是否发光 */
  glowOnHover?: boolean;
}) {
  return (
    <div
      data-slot="card-interactive"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-5 rounded-xl border border-[rgba(255,255,255,0.08)] py-5",
        "transition-all duration-250 ease-out",
        "hover:border-[rgba(94,106,210,0.3)] hover:bg-[#1A1A1E] hover:shadow-lg",
        glowOnHover && "hover:shadow-[0_8px_24px_rgba(94,106,210,0.15)]",
        "hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-5",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-sm font-semibold text-[#EDEDEF] tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-[#A1A1AA]", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-5 [.border-t]:pt-5", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardInteractive,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
