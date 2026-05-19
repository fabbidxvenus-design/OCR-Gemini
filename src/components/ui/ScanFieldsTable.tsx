import { ScanField, SCAN_FIELDS, findScanField } from '@/lib/scanFields';
import { OCRField } from '@/lib/apiTypes';
import FieldRow from './FieldRow';
import FieldsStatusBar from './FieldsStatusBar';
import ARSection from './ARSection';

interface ScanFieldsTableProps {
  fields: OCRField[];
  onFieldChange?: (fieldKey: string, value: string) => void;
  editable?: boolean;
  savingFieldKey?: string | null;
  showStatusBar?: boolean;
  showAllScanFields?: boolean;
}

function isNumericFieldName(name: string): boolean {
  return /^\d+$/.test(name.trim());
}

function getFieldValue(fields: OCRField[], scanField: ScanField): string {
  const field = fields.find(f => matchesRenderedScanField(f, scanField));
  if (!field) return '';
  if (scanField.key === 'barcode' && isNumericFieldName(field.field)) return field.value || field.field;
  return field.value || '';
}

function matchesRenderedScanField(field: OCRField, scanField: ScanField): boolean {
  const matched = findScanField(field.field);
  if (matched?.key === scanField.key) return true;
  return scanField.key === 'barcode' && !matched && isNumericFieldName(field.field);
}

function getFieldConfidence(fields: OCRField[], scanField: ScanField): 'high' | 'medium' | 'low' | undefined {
  const field = fields.find(f => matchesRenderedScanField(f, scanField));
  return field?.confidence;
}

export default function ScanFieldsTable({
  fields,
  onFieldChange,
  editable = false,
  savingFieldKey = null,
  showStatusBar = true,
  showAllScanFields = true,
}: ScanFieldsTableProps) {
  const rawText = fields.find((f) => f.field === 'rawText')?.value;
  const processedFields = fields.filter((f) => f.field !== 'rawText');
  const scanFieldsToRender = showAllScanFields
    ? SCAN_FIELDS
    : SCAN_FIELDS.filter((scanField) => getFieldValue(processedFields, scanField).trim().length > 0);
  const requiredFields = SCAN_FIELDS.filter((f) => f.required);
  const filledRequired = requiredFields.filter((sf) => {
    const value = getFieldValue(processedFields, sf);
    return value.trim().length > 0;
  }).length;

  return (
    <>
      <div className="w-full">
        {showStatusBar && (
          <FieldsStatusBar
            filledRequired={filledRequired}
            totalRequired={requiredFields.length}
          />
        )}
        <table className="w-full">
          <tbody>
            {scanFieldsToRender.map((scanField) => (
              <FieldRow
                key={scanField.key}
                scanField={scanField}
                value={getFieldValue(processedFields, scanField)}
                confidence={getFieldConfidence(processedFields, scanField)}
                editable={editable}
                isSaving={savingFieldKey === scanField.key}
                onChange={(value) => onFieldChange?.(scanField.key, value)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ARSection rawText={rawText} />
    </>
  );
}
