import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-sm font-medium transform-gpu transition-[transform,box-shadow,opacity,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring will-change-transform before:pointer-events-none before:absolute before:inset-0 before:-translate-x-[140%] before:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.12)_45%,rgba(255,255,255,0.28)_50%,rgba(255,255,255,0.12)_55%,transparent_100%)] before:opacity-0 before:transition-[transform,opacity] before:duration-1000 hover:-translate-y-[3px] hover:shadow-[0_12px_34px_rgba(0,0,0,0.24)] hover:before:translate-x-[140%] hover:before:opacity-100 active:translate-y-0 active:scale-[0.98] active:shadow-[0_2px_10px_rgba(0,0,0,0.2)] disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:before:translate-x-0 disabled:before:opacity-0 aria-[busy=true]:translate-y-0 aria-[busy=true]:scale-100 aria-[busy=true]:cursor-not-allowed aria-[busy=true]:opacity-60 aria-[busy=true]:shadow-none aria-[busy=true]:before:translate-x-0 aria-[busy=true]:before:opacity-0 data-[busy=true]:translate-y-0 data-[busy=true]:scale-100 data-[busy=true]:cursor-not-allowed data-[busy=true]:opacity-60 data-[busy=true]:shadow-none data-[busy=true]:before:translate-x-0 data-[busy=true]:before:opacity-0 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:before:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          data-busy={isLoading ? "true" : undefined}
          aria-busy={isLoading || undefined}
          aria-disabled={isDisabled || undefined}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        data-busy={isLoading ? "true" : undefined}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <span
            className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
