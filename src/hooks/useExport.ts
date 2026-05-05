import { useState } from 'react';
import { exportToExcel } from '@/lib/excel';
import type { ScanRecord } from '@/db/schema';

interface UseExportReturn {
  isExporting: boolean;
  error: string | null;
  exportScan: (scan: ScanRecord) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportScan = async (scan: ScanRecord) => {
    setIsExporting(true);
    setError(null);

    try {
      await exportToExcel(scan);
    } catch (err) {
      console.error('[Export] Error:', err);
      setError('Không thể xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    error,
    exportScan,
  };
}