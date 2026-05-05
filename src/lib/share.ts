import type { OCRResponse } from '@/db/schema';

export interface ShareData {
  title: string;
  text: string;
}

export function formatOCRForSharing(ocr: OCRResponse): string {
  let text = '';

  // Title
  if (ocr.title) {
    text += `${ocr.title}\n`;
    text += '='.repeat(ocr.title.length) + '\n\n';
  }

  // Structured fields
  if (ocr.fields && ocr.fields.length > 0) {
    text += 'THÔNG TIN:\n';
    ocr.fields.forEach((field) => {
      text += `${field.field}: ${field.value}\n`;
    });
    text += '\n';
  }

  // Size table
  if (ocr.sizes && ocr.sizes.length > 0) {
    text += 'BẢNG SIZE:\n';
    ocr.sizes.forEach((size) => {
      text += `${size.size}: ${size.quantity}\n`;
    });
    text += '\n';
  }

  // Raw text
  if (ocr.raw_text) {
    text += 'VĂN BẢN GỐC:\n';
    text += ocr.raw_text + '\n\n';
  }

  // Notes
  if (ocr.notes && ocr.notes.length > 0) {
    text += 'GHI CHÚ:\n';
    ocr.notes.forEach((note) => {
      text += `• ${note}\n`;
    });
  }

  return text.trim();
}

export async function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API không được hỗ trợ');
  }

  await navigator.clipboard.writeText(text);
}

export async function shareData(data: ShareData): Promise<boolean> {
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name === 'AbortError') {
        // User cancelled, don't throw
        return false;
      }
      throw error;
    }
  }

  // Fallback to clipboard
  await copyToClipboard(data.text);
  return true;
}