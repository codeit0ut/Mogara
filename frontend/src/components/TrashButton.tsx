import { IconTrash } from "./icons";

type TrashButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

export function TrashButton({
  onClick,
  label = "Remove",
  className = "",
}: TrashButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-red)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-red)_10%,transparent)] hover:text-[color-mix(in_srgb,var(--color-red)_85%,#3d1515)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-red)_35%,transparent)] ${className}`}
    >
      <IconTrash className="h-4 w-4" />
    </button>
  );
}
