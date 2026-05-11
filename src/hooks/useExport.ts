import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { exportApi } from '@/lib/exportApi';
import { saveOrShareFile } from '@/lib/fileSave';
import type { ScanRecord } from '@/db/schema';

interface UseExportReturn {
  isExporting: boolean;
  error: string | null;
  exportScan: (scan: ScanRecord) => Promise<void>;
  exportMultiple: (scans: ScanRecord[]) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  const generateFilename = (count: number = 1) => {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
    return count > 1 ? `OCR_${count}scans_${timestamp}.xlsx` : `OCR_${timestamp}.xlsx`;
  };

  const exportScan = async (scan: ScanRecord) => {
    if (!accessToken) {
      setError('Bạn cần đăng nhập để xuất dữ liệu');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const blob = await exportApi.exportSingle(accessToken, scan.id);
      await saveOrShareFile(blob, generateFilename(1));
    } catch (err: any) {
      console.error('[Export] Error:', err);
      setError(err.message || 'Không thể xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportMultiple = async (scans: ScanRecord[]) => {
    if (scans.length === 0) return;
    if (!accessToken) {
      setError('Bạn cần đăng nhập để xuất dữ liệu');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const ids = scans.map((s) => s.id);
      const blob = await exportApi.exportMultiple(accessToken, ids);
      await saveOrShareFile(blob, generateFilename(scans.length));
    } catch (err: any) {
      console.error('[Export] Error:', err);
      setError(err.message || 'Không thể xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    error,
    exportScan,
    exportMultiple,
  };
}
