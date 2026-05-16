import { ScanField, SCAN_FIELDS, findScanField } from '@/lib/scanFields';
import { OCRField } from '@/lib/apiTypes';
import FieldRow from './FieldRow';
import FieldsStatusBar from './FieldsStatusBar';
import ARSection from './ARSection';

interface ScanFieldsTableProps {
  fields: OCRField[];
  onFieldChange?: (fieldKey: string, value: string) => void;
  editable?: boolean;
}

function getFieldValue(fields: OCRField[], scanField: ScanField): string {
  const field = fields.find(f => {
    const matched = findScanField(f.field);
    return matched?.key === scanField.key;
  });
  return field?.value || '';
}

function getFieldConfidence(fields: OCRField[], scanField: ScanField): 'high' | 'medium' | 'low' | undefined {
  const field = fields.find(f => {
    const matched = findScanField(f.field);
    return matched?.key === scanField.key;
  });
  return field?.confidence;
}

export default function ScanFieldsTable({
  fields,
  onFieldChange,
  editable = false,
}: ScanFieldsTableProps) {
  const rawText = fields.find((f) => f.field === 'rawText')?.value;
  const processedFields = fields.filter((f) => f.field !== 'rawText');

  const requiredFields = SCAN_FIELDS.filter((f) => f.required);
  const filledRequired = requiredFields.filter((sf) => {
    const value = getFieldValue(processedFields, sf);
    return value.trim().length > 0;
  }).length;

  return (
    <div className="w-full">
      <FieldsStatusBar
        filledRequired={filledRequired}
        totalRequired={requiredFields.length}
      />
      <table className="w-full">
        <tbody>
          {SCAN_FIELDS.map((scanField) => (
            <FieldRow
              key={scanField.key}
              scanField={scanField}
              value={getFieldValue(processedFields, scanField)}
              confidence={getFieldConfidence(processedFields, scanField)}
              editable={editable}
              onChange={(value) => onFieldChange?.(scanField.key, value)}
            />
          ))}
        </tbody>
      </table>
      <ARSection rawText={rawText} />
    </div>
  );
}