import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Input base: sin radio, borde de 1px que pasa a --fg al foco, 14px.
 * No lleva `focus:outline-none`: el anillo de foco global de
 * `:focus-visible` (2px en --fg) debe poder verse aquí también.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`min-h-hit w-full border border-line bg-paper px-3 py-2.5 text-ui text-ink transition-colors duration-fast ease-zara placeholder:text-text-3 hover:border-ink focus:border-ink focus:bg-paper focus:text-ink disabled:cursor-not-allowed disabled:border-line disabled:bg-subtle disabled:text-text-3 ${className}`}
        {...props}
      />
    );
  },
);
