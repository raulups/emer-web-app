import { forwardRef, type SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** Select base, mismo lenguaje visual que Input (foco global de :focus-visible). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className = "", children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`min-h-hit w-full border border-line bg-paper px-3 py-2.5 text-ui text-ink transition-colors duration-fast ease-zara hover:border-ink focus:border-ink focus:bg-paper focus:text-ink disabled:cursor-not-allowed disabled:bg-subtle disabled:text-text-3 ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  },
);
