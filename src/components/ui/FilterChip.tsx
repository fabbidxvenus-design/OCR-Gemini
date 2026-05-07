interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function FilterChip({
  label,
  isActive = false,
  onClick,
  className = '',
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        h-9 px-4 rounded-full text-small font-medium transition-all duration-200
        whitespace-nowrap
        ${isActive
          ? 'bg-primary-light text-primary border-2 border-primary'
          : 'bg-card text-text-secondary border-2 border-card-border hover:border-gray-300'
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}
