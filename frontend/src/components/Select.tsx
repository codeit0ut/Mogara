import type { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`box-border h-9 w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white-paper)] px-3 text-sm leading-normal text-[var(--color-ink)] outline-none transition-all duration-300 hover:border-[var(--color-border-green)] hover:bg-[var(--color-white-petal)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-focus-ring)] ${props.className ?? ""}`}
    />
  );
}
