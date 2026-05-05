interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const styles = {
    high: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-error/10 text-error border-error/20',
  };

  const labels = {
    high: 'Cao',
    medium: 'TB',
    low: 'Thấp',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${styles[confidence]}`}
    >
      {labels[confidence]}
    </span>
  );
}