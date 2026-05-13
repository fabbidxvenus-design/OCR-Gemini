import type { OCRField } from '@/db/schema';

function confidenceStyle(confidence?: OCRField['confidence']): string {
  if (confidence === 'low') return 'border-warning/40 bg-warning-light text-warning';
  if (confidence === 'high') return 'border-success/30 bg-success-light text-success';
  return 'border-primary/20 bg-primary-light text-primary';
}

interface OCRFieldCardProps {
  field: OCRField;
}

export default function OCRFieldCard({ field }: OCRFieldCardProps) {
  const isLowConfidence = field.confidence === 'low' || !field.value;

  return (
    <div className={`rounded-2xl border p-4 shadow-card ${isLowConfidence ? 'border-warning/40 bg-warning-light/60' : 'border-card-border bg-card'}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-caption font-semibold uppercase tracking-[0.12em] text-text-muted">{field.field}</p>
        <span className={`rounded-full border px-2.5 py-1 text-caption font-semibold ${confidenceStyle(field.confidence)}`}>
          {field.confidence === 'low' ? 'Cần kiểm tra' : field.confidence === 'high' ? 'Tin cậy' : 'Ổn định'}
        </span>
      </div>
      <p className="break-words font-display text-heading-sm text-text-primary">{field.value || 'Thiếu dữ liệu'}</p>
    </div>
  );
}
