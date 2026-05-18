import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { saveOrShareFile } from '@/lib/fileSave';
import type { ScanRecord } from '@/db/schema';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.includes('Failed to fetch dynamically imported module')) {
    return 'Không thể tải chức năng xuất Excel. Vui lòng kiểm tra kết nối mạng.';
  }
  return err instanceof Error ? err.message : 'Không thể xuất file Excel. Vui lòng thử lại.';
}

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

  const getExcelApi = async () => {
    const module = await import('@/lib/excel');
    return module.excel;
  };

  const exportScan = async (scan: ScanRecord) => {
    if (!accessToken) {
      setError('Bạn cần đăng nhập để xuất dữ liệu');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const excelApi = await getExcelApi();
      const blob = await excelApi.exportSingle(accessToken, scan.id);
      await saveOrShareFile(blob, generateFilename(1));
    } catch (err) {
      console.error('[Export] Error:', err);
      setError(getErrorMessage(err));
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
      const excelApi = await getExcelApi();
      const blob = await excelApi.exportMultiple(accessToken, ids);
      await saveOrShareFile(blob, generateFilename(scans.length));
    } catch (err) {
      console.error('[Export] Error:', err);
      setError(getErrorMessage(err));
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
