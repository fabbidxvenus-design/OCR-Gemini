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

    return compressedBlob;
  } catch {
    throw new Error('Không thể nén ảnh. Vui lòng thử lại.');
  }
}

/**
 * Ultra-fast compression for OCR - target <150ms, <50KB output
 * Resizes to 640px max and reduces quality to 0.6
 */
export async function compressImageForOCR(
  fileOrBlob: File | Blob
): Promise<Blob> {
  try {
    const file = fileOrBlob as File;
    const compressedBlob = await imageCompression(file, {
      maxSizeMB: 0.05, // Target <50KB
      maxWidthOrHeight: 640, // Ultra reduced from 800
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.6, // Lower quality for speed
    });

    return compressedBlob;
  } catch {
    // Fallback: try with less aggressive settings
    return compressImage(fileOrBlob, { maxWidthOrHeight: 640, maxSizeMB: 0.1 });
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
