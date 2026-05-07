# TIP-016: Export Actions (Clipboard + Share)

## HEADER
- **TIP-ID**: TIP-016
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Export
- **Priority**: P1
- **Depends on**: TIP-009, TIP-014
- **Estimated**: 4 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3
- **Key files to read first**: 
  - `src/pages/OCRResultPage.tsx` (add copy/share actions)
  - `src/pages/HistoryDetailPage.tsx` (add copy/share actions)
- **Patterns to follow**: Web Share API with clipboard fallback, toast notifications

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Add copy to clipboard and share functionality to OCR result and history detail pages. Use Web Share API when available (mobile), fallback to clipboard copy. Copy structured data as formatted text. Share includes title, fields, and sizes. Show toast notification on success. Handle errors gracefully with user-friendly messages.

---

## SPECIFICATIONS

### Business Rules

1. **Copy to clipboard**: Copy structured data as formatted text
2. **Share**: Use Web Share API when available, fallback to clipboard
3. **Format**: Title + fields (key: value) + sizes table
4. **Toast notifications**: Success/error feedback
5. **Mobile-first**: Prioritize Web Share API for mobile devices
6. **Fallback**: Clipboard API for desktop or unsupported browsers

### Copy/Share Utilities

**src/lib/share.ts**:
```typescript
import type { OCRResponse } from './gemini';

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
```

### Share Hook

**src/hooks/useShare.ts**:
```typescript
import { useState } from 'react';
import { formatOCRForSharing, shareData, copyToClipboard } from '@/lib/share';
import type { OCRResponse } from '@/lib/gemini';

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
```

### Toast Component

**src/components/ui/Toast.tsx**:
```typescript
import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
          type === 'success'
            ? 'bg-success text-white'
            : 'bg-error text-white'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

### Updated OCR Result Page

**src/pages/OCRResultPage.tsx** (add copy/share buttons):
```typescript
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { useShare } from '@/hooks/useShare';
import { Edit, Download, Copy, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import ConfidenceBadge from '@/components/ocr/ConfidenceBadge';

export default function OCRResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const { isExporting, exportScan } = useExport();
  const { isSharing, isCopying, shareOCR, copyOCR } = useShare();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    fields: true,
    sizes: true,
    rawText: false,
    notes: false,
  });

  // ... existing code ...

  const handleCopy = async () => {
    if (!scan) return;

    try {
      await copyOCR(scan.ocrStructured);
      setToast({ message: 'Đã sao chép vào clipboard', type: 'success' });
    } catch (error) {
      setToast({ message: 'Không thể sao chép', type: 'error' });
    }
  };

  const handleShare = async () => {
    if (!scan) return;

    try {
      await shareOCR(scan.ocrStructured, scan.ocrStructured.title);
      
      // Only show toast if using clipboard fallback (Web Share API doesn't need toast)
      if (!navigator.share) {
        setToast({ message: 'Đã sao chép vào clipboard', type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Không thể chia sẻ', type: 'error' });
    }
  };

  // ... existing sections ...

  return (
    <Layout title="Kết quả OCR">
      <div className="p-4 space-y-4 pb-32">
        {/* ... existing sections ... */}

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={handleCopy}
              disabled={isCopying}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors touch-target"
            >
              <Copy className="w-5 h-5" />
              Sao chép
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors touch-target"
            >
              <Share2 className="w-5 h-5" />
              Chia sẻ
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors touch-target"
            >
              <Edit className="w-5 h-5" />
              Sửa
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors touch-target"
            >
              <Download className="w-5 h-5" />
              Xuất
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}
```

### Add Animation to Tailwind

**tailwind.config.js** (add slide-up animation):
```javascript
module.exports = {
  // ... existing config ...
  theme: {
    extend: {
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
};
```

### Validation

1. **Copy**: Copies formatted text to clipboard
2. **Share**: Uses Web Share API on mobile, clipboard on desktop
3. **Format**: Title, fields, sizes, raw text, notes
4. **Toast**: Shows success/error feedback
5. **Auto-dismiss**: Toast disappears after 3 seconds

### Error Handling

- **Clipboard not supported**: Show error toast
- **Share cancelled**: No error, silent return
- **Share failed**: Show error toast
- **Network error**: Handle gracefully

---

## ACCEPTANCE CRITERIA

### AC-001: Copy Button
- **Given**: User is on OCR result page
- **When**: User taps "Sao chép" button
- **Then**:
  - Formatted text copied to clipboard
  - Success toast shows: "Đã sao chép vào clipboard"
  - Toast auto-dismisses after 3 seconds

### AC-002: Share Button - Mobile
- **Given**: User is on mobile device with Web Share API
- **When**: User taps "Chia sẻ" button
- **Then**:
  - Native share sheet opens
  - Title and text are pre-filled
  - User can choose share target

### AC-003: Share Button - Desktop
- **Given**: User is on desktop without Web Share API
- **When**: User taps "Chia sẻ" button
- **Then**:
  - Text copied to clipboard (fallback)
  - Success toast shows: "Đã sao chép vào clipboard"

### AC-004: Formatted Text Structure
- **Given**: Scan has title "INVOICE #123", 2 fields, 2 sizes
- **When**: User copies or shares
- **Then**:
  - Text format:
    ```
    INVOICE #123
    ============

    THÔNG TIN:
    Contract No: ABC123
    Date: 2026-05-05

    BẢNG SIZE:
    M: 10
    L: 15
    ```

### AC-005: Toast Success
- **Given**: Copy succeeds
- **When**: Toast displays
- **Then**:
  - Green background
  - CheckCircle icon
  - Message: "Đã sao chép vào clipboard"
  - Close button (X)
  - Auto-dismisses after 3 seconds

### AC-006: Toast Error
- **Given**: Copy fails
- **When**: Toast displays
- **Then**:
  - Red background
  - AlertCircle icon
  - Message: "Không thể sao chép"
  - Close button (X)
  - Auto-dismisses after 3 seconds

### AC-007: Toast Manual Close
- **Given**: Toast is visible
- **When**: User taps close button (X)
- **Then**:
  - Toast disappears immediately
  - Timer is cleared

### AC-008: Share Cancelled
- **Given**: User opens share sheet
- **When**: User cancels share
- **Then**:
  - No error toast
  - No action taken
  - Silent return

### AC-009: Button States
- **Given**: Copy or share in progress
- **When**: Button is clicked
- **Then**:
  - Button is disabled
  - Opacity reduced to 50%
  - Cannot click again until complete

### AC-010: History Detail Page
- **Given**: User is on history detail page
- **When**: User taps copy or share
- **Then**:
  - Same behavior as OCR result page
  - Copy/share buttons work identically

---

## CONSTRAINTS

### DO NOT:
- ❌ Implement custom share targets — use native share sheet
- ❌ Add image sharing — text only for MVP
- ❌ Implement share history — out of scope
- ❌ Add social media direct share — use Web Share API
- ❌ Implement QR code generation — out of scope
- ❌ Add email integration — use Web Share API

### REUSE:
- ✅ Web Share API (native mobile sharing)
- ✅ Clipboard API (fallback)
- ✅ Lucide React icons
- ✅ Tailwind utility classes

### SKIP (out of scope for TIP-016):
- ⏭️ Image sharing
- ⏭️ Share history
- ⏭️ Social media direct share
- ⏭️ QR code generation
- ⏭️ Email integration
- ⏭️ Custom share targets

---

## COMPLETION CHECKLIST

- [ ] `src/lib/share.ts` created
- [ ] `src/hooks/useShare.ts` created
- [ ] `src/components/ui/Toast.tsx` created
- [ ] `src/pages/OCRResultPage.tsx` updated
- [ ] `src/pages/HistoryDetailPage.tsx` updated
- [ ] `tailwind.config.js` updated with animation
- [ ] Copy to clipboard works
- [ ] Share uses Web Share API on mobile
- [ ] Share falls back to clipboard on desktop
- [ ] Formatted text structure correct
- [ ] Success toast displays
- [ ] Error toast displays
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Toast manual close works
- [ ] Button states work (disabled during action)
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-016 | Generated: 2026-05-05 | Vibecode Kit v5.0*
