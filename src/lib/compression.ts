import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
};

export async function compressImage(
  fileOrBlob: File | Blob,
  options?: CompressionOptions
): Promise<Blob> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const file = fileOrBlob as File;
    const compressedBlob = await imageCompression(file, {
      maxSizeMB: mergedOptions.maxSizeMB!,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight!,
      useWebWorker: mergedOptions.useWebWorker!,
      fileType: 'image/jpeg',
    });

    console.log(`[Compression] Original: ${(fileOrBlob as File).size || fileOrBlob.size} bytes, Compressed: ${compressedBlob.size} bytes`);

    return compressedBlob;
  } catch (error) {
    console.error('[Compression] Error:', error);
    throw new Error('Không thể nén ảnh. Vui lòng thử lại.');
  }
}

/**
 * Aggressive compression for OCR - optimized for speed (<200ms)
 * Resizes to 800px max and reduces quality to 0.7
 */
export async function compressImageForOCR(
  fileOrBlob: File | Blob
): Promise<Blob> {
  const startTime = performance.now();

  try {
    const file = fileOrBlob as File;
    const compressedBlob = await imageCompression(file, {
      maxSizeMB: 0.1, // Target <100KB
      maxWidthOrHeight: 800, // Reduced from 1024 to 800
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.7, // Lower quality for faster compression
    });

    const elapsed = performance.now() - startTime;
    console.log(`[Compression-OCR] ${(fileOrBlob as File).size || fileOrBlob.size} → ${compressedBlob.size} bytes in ${elapsed.toFixed(0)}ms`);

    return compressedBlob;
  } catch (error) {
    // Fallback: try with less aggressive settings
    console.warn('[Compression-OCR] Aggressive failed, trying fallback:', error);
    return compressImage(fileOrBlob, { maxWidthOrHeight: 800, maxSizeMB: 0.2 });
  }
}

export async function compressImageToDataUrl(
  fileOrBlob: File | Blob,
  options?: CompressionOptions
): Promise<string> {
  const compressedBlob = await compressImage(fileOrBlob, options);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressedBlob);
  });
}
