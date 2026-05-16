import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FieldsStatusBarProps {
  filledRequired: number;
  totalRequired: number;
}

/**
 * Status bar showing filled required fields count
 */
export default function FieldsStatusBar({ filledRequired, totalRequired }: FieldsStatusBarProps) {
  const allFilled = filledRequired === totalRequired;

  return (
    <div
      className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-small ${
        allFilled
          ? 'bg-success-light text-success'
          : 'bg-warning-light text-warning'
      }`}
    >
      {allFilled ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span>Đã điền đầy đủ {totalRequired} trường bắt buộc</span>
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4" />
          <span>
            Thiếu {totalRequired - filledRequired} trường bắt buộc
          </span>
        </>
      )}
    </div>
  );
}