import { useState } from 'react';
import { formatOCRForSharing, shareData, copyToClipboard } from '@/lib/share';
import type { OCRResponse } from '@/db/schema';

interface UseShareReturn {
  isSharing: boolean;
  isCopying: boolean;
  error: string | null;
  shareOCR: (ocr: OCRResponse, title?: string) => Promise<void>;
  copyOCR: (ocr: OCRResponse) => Promise<void>;
}

export function useShare(): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareOCR = async (ocr: OCRResponse, title?: string) => {
    setIsSharing(true);
    setError(null);

    try {
      const text = formatOCRForSharing(ocr);
      const shareTitle = title || ocr.title || 'Kết quả OCR';

      const shared = await shareData({
        title: shareTitle,
        text,
      });

      if (!shared) {
        // User cancelled
        return;
      }
    } catch (err) {
      console.error('[Share] Error:', err);
      setError('Không thể chia sẻ. Vui lòng thử lại.');
      throw err;
    } finally {
      setIsSharing(false);
    }
  };

  const copyOCR = async (ocr: OCRResponse) => {
    setIsCopying(true);
    setError(null);

    try {
      const text = formatOCRForSharing(ocr);
      await copyToClipboard(text);
    } catch (err) {
      console.error('[Copy] Error:', err);
      setError('Không thể sao chép. Vui lòng thử lại.');
      throw err;
    } finally {
      setIsCopying(false);
    }
  };

  return {
    isSharing,
    isCopying,
    error,
    shareOCR,
    copyOCR,
  };
}