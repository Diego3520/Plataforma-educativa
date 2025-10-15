import * as React from "react";
import { cn } from "@/lib/utils";

const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const variants: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
};

const sizes: Record<string, string> = {
  default: "h-10 px-4 py-2",
  lg: "h-11 rounded-md px-8",
  sm: "h-9 rounded-md px-3",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants | string;
  size?: keyof typeof sizes | string;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
  const classes = cn(base, variants[variant] ?? variants.default, sizes[size] ?? sizes.default, className);

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any, any>;
    const childProps: any = child.props || {};
    const childClassName = cn(childProps.className, classes);
    return React.cloneElement(child, { className: childClassName, ...props });
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
