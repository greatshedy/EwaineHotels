import { forwardRef } from "react";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25",
  secondary: "bg-secondary text-white hover:bg-amber-600 shadow-lg shadow-secondary/25",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  ghost: "text-text-secondary hover:bg-surface-alt dark:hover:bg-dark-surface",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

const Button = forwardRef(function Button({ variant = "primary", size = "md", className = "", children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
