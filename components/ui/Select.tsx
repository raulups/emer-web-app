import { forwardRef, type SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** Select base, mismo lenguaje visual que Input (foco global de :focus-visible). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className = "", children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`w-full border border-line bg-paper px-3 py-2.5 text-ui text-ink transition-colors duration-fast ease-zara hover:border-muted-text focus:border-ink ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  },
);
