import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ 
  className, 
  type, 
  hasError = false,
  ...props 
}: React.ComponentProps<"input"> & {
  /** 是否有错误状态 */
  hasError?: boolean;
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#71717A] selection:bg-primary selection:text-primary-foreground",
        "h-9 w-full min-w-0 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#18181B] px-3 py-1.5 text-[13px] text-[#EDEDEF] transition-all duration-200",
        "placeholder:text-[#71717A]",
        !hasError && "focus:outline-none focus:border-[rgba(94,106,210,0.5)] focus:ring-2 focus:ring-[rgba(94,106,210,0.15)] focus:bg-[#1A1A1E]",
        hasError && "border-[rgba(244,63,94,0.5)] focus:border-[#F43F5E] focus:ring-2 focus:ring-[rgba(244,63,94,0.15)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-[rgba(255,255,255,0.12)]",
        className
      )}
      {...props}
    />
  )
}

/**
 * 输入框组 - 带图标
 */
function InputWithIcon({ 
  className, 
  icon,
  iconPosition = 'left',
  ...props 
}: React.ComponentProps<"input"> & {
  /** 图标组件 */
  icon?: React.ReactNode;
  /** 图标位置 */
  iconPosition?: 'left' | 'right';
}) {
  return (
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={props.type || 'text'}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-[#71717A] selection:bg-primary selection:text-primary-foreground",
          "h-9 w-full min-w-0 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#18181B] px-3 py-1.5 text-[13px] text-[#EDEDEF] transition-all duration-200",
          "placeholder:text-[#71717A]",
          "focus:outline-none focus:border-[rgba(94,106,210,0.5)] focus:ring-2 focus:ring-[rgba(94,106,210,0.15)] focus:bg-[#1A1A1E]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-[rgba(255,255,255,0.12)]",
          icon && iconPosition === 'left' && "pl-10",
          icon && iconPosition === 'right' && "pr-10",
          className
        )}
        {...props}
      />
      {icon && iconPosition === 'right' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  )
}

/**
 * 带浮动标签的输入框
 */
function FloatingLabelInput({ 
  className, 
  label,
  id,
  ...props 
}: React.ComponentProps<"input"> & {
  /** 标签文本 */
  label: string;
}) {
  const [focused, setFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none",
          focused || hasValue 
            ? "top-1 text-[10px] text-[#5E6AD2]" 
            : "top-1/2 -translate-y-1/2 text-[13px] text-[#71717A]"
        )}
      >
        {label}
      </label>
      <input
        id={id}
        type={props.type || 'text'}
        data-slot="input"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setHasValue(!!e.target.value);
          props.onChange?.(e);
        }}
        className={cn(
          "file:text-foreground placeholder:text-transparent selection:bg-primary selection:text-primary-foreground",
          "h-12 w-full min-w-0 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#18181B] px-3 pt-5 pb-1 text-[13px] text-[#EDEDEF] transition-all duration-200",
          "focus:outline-none focus:border-[rgba(94,106,210,0.5)] focus:ring-2 focus:ring-[rgba(94,106,210,0.15)] focus:bg-[#1A1A1E]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-[rgba(255,255,255,0.12)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input, InputWithIcon, FloatingLabelInput }
