# TIP-008: Image Compression

## HEADER
- **TIP-ID**: TIP-008
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Image Processing
- **Priority**: P0
- **Depends on**: TIP-001
- **Estimated**: 4 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + browser-image-compression 2
- **Key files to read first**: 
  - `src/pages/CameraPage.tsx` (will be updated to compress before OCR)
  - `BUILDER-HANDOFF.md` (performance budgets, image compression patterns)
- **Patterns to follow**: Client-side compression, target 1024px max width, <1MB file size

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Implement client-side image compression using browser-image-compression library. Compress captured images before sending to Gemini API to reduce API costs and improve performance. Target 1024px max width and <1MB file size while maintaining OCR quality. Create compression utility with configurable options. Update CameraPage to compress images before OCR processing.

---

## SPECIFICATIONS

### Business Rules

1. **Max width**: 1024px (maintains OCR quality while reducing size)
2. **Max file size**: 1MB (reduces API costs and upload time)
3. **Quality**: 0.8 (balance between size and OCR accuracy)
4. **Format**: JPEG (smaller than PNG for photos)
5. **Preserve aspect ratio**: Do not distort images
6. **Compression timing**: After capture, before OCR processing
7. **Fallback**: If compression fails, use original image

### Compression Utility

**src/lib/compression.ts**:
```typescript
import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

export interface CompressionResult {
  compressedBlob: Blob;
  compressedDataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidthOrHeight: 1024,
  maxSizeMB: 1,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.8,
};

export async function compressImage(
  imageBlob: Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const originalSize = imageBlob.size;

  try {
    const compressedBlob = await imageCompression(imageBlob, mergedOptions);
    const compressedSize = compressedBlob.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    // Convert to data URL for preview
    const compressedDataUrl = await blobToDataURL(compressedBlob);

    console.log('[Compression] Success:', {
      originalSize: formatBytes(originalSize),
      compressedSize: formatBytes(compressedSize),
      compressionRatio: `${compressionRatio.toFixed(1)}%`,
    });

    return {
      compressedBlob,
      compressedDataUrl,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('[Compression] Error:', error);
    
    // Fallback: return original image
    const dataUrl = await blobToDataURL(imageBlob);
    return {
      compressedBlob: imageBlob,
      compressedDataUrl: dataUrl,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function shouldCompress(imageBlob: Blob): boolean {
  // Compress if image is larger than 1MB or dimensions likely exceed 1024px
  const sizeMB = imageBlob.size / (1024 * 1024);
  return sizeMB > 1;
}
```

### Compression Hook

**src/hooks/useCompression.ts**:
```typescript
import { useState } from 'react';
import { compressImage, type CompressionResult } from '@/lib/compression';

interface UseCompressionReturn {
  isCompressing: boolean;
  compress: (imageBlob: Blob) => Promise<CompressionResult>;
}

export function useCompression(): UseCompressionReturn {
  const [isCompressing, setIsCompressing] = useState(false);

  const compress = async (imageBlob: Blob): Promise<CompressionResult> => {
    setIsCompressing(true);
    try {
      const result = await compressImage(imageBlob);
      return result;
    } finally {
      setIsCompressing(false);
    }
  };

  return {
    isCompressing,
    compress,
  };
}
```

### Updated Camera Page with Compression

**src/pages/CameraPage.tsx**:
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CameraView from '@/components/camera/CameraView';
import ImagePreview from '@/components/camera/ImagePreview';
import { useOCR } from '@/hooks/useOCR';
import { useCompression } from '@/hooks/useCompression';
import { Loader2 } from 'lucide-react';

export default function CameraPage() {
  const navigate = useNavigate();
  const { isProcessing, error, processImage } = useOCR();
  const { isCompressing, compress } = useCompression();
  const [capturedImage, setCapturedImage] = useState<{
    blob: Blob;
    dataUrl: string;
  } | null>(null);

  const handleCapture = (blob: Blob, dataUrl: string) => {
    setCapturedImage({ blob, dataUrl });
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = async () => {
    if (!capturedImage) return;

    // Compress image before OCR
    const compressionResult = await compress(capturedImage.blob);

    // Process OCR with compressed image
    const scanId = await processImage(
      compressionResult.compressedBlob,
      compressionResult.compressedDataUrl
    );
    
    if (scanId) {
      // Navigate to history (edit page in TIP-010)
      navigate('/history');
    }
  };

  if (isCompressing || isProcessing) {
    return (
      <Layout title="Đang xử lý..." showBottomNav={false}>
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-neutral">
            {isCompressing ? 'Đang nén ảnh...' : 'Đang quét OCR...'}
          </p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Lỗi" showBottomNav={false}>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-4">
            <p className="text-error text-center">{error}</p>
          </div>
          <button
            onClick={handleRetake}
            className="bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors touch-target"
          >
            Thử lại
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Chụp ảnh" showBottomNav={!capturedImage}>
      <div className="h-full">
        {capturedImage ? (
          <ImagePreview
            imageDataUrl={capturedImage.dataUrl}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
          />
        ) : (
          <CameraView onCapture={handleCapture} />
        )}
      </div>
    </Layout>
  );
}
```

### Validation

1. **Max width**: Compressed images should not exceed 1024px width/height
2. **Max size**: Compressed images should be <1MB
3. **Quality**: OCR accuracy should not be significantly affected
4. **Format**: Output should be JPEG
5. **Fallback**: If compression fails, use original image
6. **Performance**: Compression should complete in <2 seconds

### Error Handling

- **Compression failure**: Log error, use original image as fallback
- **Web Worker failure**: Fallback to main thread compression
- **Invalid image**: Log error, show user-friendly message

---

## ACCEPTANCE CRITERIA

### AC-001: Compression Library
- **Given**: Project dependencies are installed
- **When**: Checking package.json
- **Then**:
  - browser-image-compression is listed in dependencies
  - Version is ^2.0.0 or higher

### AC-002: Compress Large Image
- **Given**: User captures 4MB image (3000x2000px)
- **When**: Image is compressed
- **Then**:
  - Compressed image is <1MB
  - Max dimension is 1024px
  - Aspect ratio is preserved
  - Format is JPEG

### AC-003: Skip Small Image
- **Given**: User uploads 500KB image (800x600px)
- **When**: shouldCompress() is called
- **Then**:
  - Returns false (no compression needed)
  - Original image is used

### AC-004: Compression Ratio
- **Given**: 4MB image is compressed to 800KB
- **When**: Compression completes
- **Then**:
  - compressionRatio is calculated: ((4000000 - 800000) / 4000000) * 100 = 80%
  - Console logs: "originalSize: 4 MB, compressedSize: 800 KB, compressionRatio: 80.0%"

### AC-005: Loading State
- **Given**: User taps "Xác nhận" on captured image
- **When**: Compression starts
- **Then**:
  - Loading screen shows with spinner
  - Message: "Đang nén ảnh..."
  - BottomNav is hidden

### AC-006: Compression Success
- **Given**: Image compression completes successfully
- **When**: OCR processing starts
- **Then**:
  - Compressed blob is passed to processImage()
  - Compressed data URL is used for preview
  - Loading message changes to "Đang quét OCR..."

### AC-007: Compression Failure Fallback
- **Given**: Compression fails with error
- **When**: Error is caught
- **Then**:
  - Error is logged to console
  - Original image blob is used
  - Original data URL is used
  - compressionRatio is 0
  - OCR processing continues normally

### AC-008: Web Worker
- **Given**: Browser supports Web Workers
- **When**: Compression runs
- **Then**:
  - Compression runs in Web Worker (off main thread)
  - UI remains responsive during compression

### AC-009: Format Bytes Helper
- **Given**: Various byte sizes
- **When**: formatBytes() is called
- **Then**:
  - 0 → "0 Bytes"
  - 1024 → "1 KB"
  - 1048576 → "1 MB"
  - 4194304 → "4 MB"

### AC-010: OCR Quality
- **Given**: Compressed image is sent to Gemini API
- **When**: OCR results are returned
- **Then**:
  - OCR accuracy is comparable to uncompressed image
  - All text fields are readable
  - No significant quality degradation

---

## CONSTRAINTS

### DO NOT:
- ❌ Compress images server-side — client-side only for POC
- ❌ Use aggressive compression (quality <0.7) — affects OCR accuracy
- ❌ Compress to WebP — use JPEG for compatibility
- ❌ Block UI during compression — use Web Worker
- ❌ Skip compression for large images — always compress >1MB
- ❌ Modify original image — keep original for reference

### REUSE:
- ✅ browser-image-compression library (battle-tested)
- ✅ Web Workers for off-thread processing
- ✅ Existing blob/dataURL conversion utilities
- ✅ formatBytes helper from TIP-004 (db-utils.ts)

### SKIP (out of scope for TIP-008):
- ⏭️ Server-side compression
- ⏭️ Multiple compression quality presets
- ⏭️ Image editing (crop, rotate, filters)
- ⏭️ Batch compression
- ⏭️ Progressive JPEG
- ⏭️ WebP format support

---

## COMPLETION CHECKLIST

- [ ] `src/lib/compression.ts` created
- [ ] `src/hooks/useCompression.ts` created
- [ ] `src/pages/CameraPage.tsx` updated with compression
- [ ] browser-image-compression installed
- [ ] Compression works (reduces size and dimensions)
- [ ] Loading state shows "Đang nén ảnh..."
- [ ] Compression ratio calculated and logged
- [ ] Fallback to original image on error
- [ ] Web Worker used for compression
- [ ] formatBytes helper works
- [ ] OCR quality maintained after compression
- [ ] No TypeScript errors
- [ ] No console errors (except expected compression logs)

---

## NOTES FOR BUILDER

1. **Install dependency**: `npm install browser-image-compression`
2. **Quality setting**: 0.8 is optimal for OCR (tested with Python scripts)
3. **Max width**: 1024px maintains OCR accuracy while reducing API costs
4. **Web Worker**: Enabled by default, keeps UI responsive
5. **Testing**: Test with large images (>4MB) from real camera captures
6. **Performance**: Compression typically takes 500ms-2s depending on image size

---

*TIP-008 | Generated: 2026-05-05 | Vibecode Kit v5.0*
