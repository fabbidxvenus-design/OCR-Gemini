import { useState } from 'react';
import { ScanField } from '@/lib/scanFields';
import { AlertTriangle, CheckCircle2, Edit2, Save, X } from 'lucide-react';

interface FieldRowProps {
  scanField: ScanField;
  value: string;
  confidence?: 'high' | 'medium' | 'low';
  editable?: boolean;
  onChange?: (value: string) => void;
}

/**
 * Field row component - displays a single field with optional editing
 */
export default function FieldRow({
  scanField,
  value,
  confidence,
  editable = false,
  onChange,
}: FieldRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  // Lazy initialization: editValue starts as value; re-sync only via handleCancel.
  // This avoids synchronous setState inside useEffect and prevents value changes
  // from overwriting user edits mid-session. The parent controls reset via reset().
  const [editValue, setEditValue] = useState(value);

  const hasValue = value.trim().length > 0;
  const showWarning = scanField.required && !hasValue;
  const confidenceLow = confidence === 'low';

  const handleSave = () => {
    onChange?.(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <tr className={showWarning ? 'bg-warning-light/30' : undefined}>
      <td className="py-3 pl-0 align-top">
        <div className="flex items-center gap-1.5">
          {showWarning ? (
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
          ) : hasValue ? (
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
          ) : null}
          <span className="text-small font-medium text-text-primary">
            {scanField.labelVi}
          </span>
          {scanField.required && (
            <span className="text-caption text-error">*</span>
          )}
        </div>
      </td>
      <td className="py-3 pr-0 align-top">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="input-surface flex-1 text-small"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="btn-icon btn-icon-sm text-success"
              aria-label="Lưu"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="btn-icon btn-icon-sm text-text-muted"
              aria-label="Hủy"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`text-small ${
                showWarning || confidenceLow
                  ? 'text-warning font-medium'
                  : 'text-text-primary'
              }`}
            >
              {showWarning ? 'Chưa nhập' : value || '-'}
            </span>
            {editable && hasValue && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-icon btn-icon-sm text-text-muted"
                aria-label="Sửa trường này"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}