import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold tracking-[-0.01em] press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Accent-fill pill — the signature CTA. */
        default: "bg-primary text-primary-foreground shadow-cta hover:brightness-[1.03]",
        /** Extra-pop CTA used on sticky book bars. */
        pop: "bg-primary text-primary-foreground shadow-cta-pop hover:brightness-[1.03]",
        /** Dark ink fill. */
        dark: "bg-ink text-white shadow-soft hover:brightness-125",
        secondary: "bg-card text-ink shadow-icon hover:bg-secondary",
        outline: "border border-input bg-transparent text-ink hover:bg-secondary",
        ghost: "text-ink hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-105",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-[22px] text-[15px]",
        sm: "h-[30px] px-[14px] text-xs",
        md: "h-[42px] px-5 text-sm",
        lg: "h-[54px] px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, asChild, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={asChild ? undefined : disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
