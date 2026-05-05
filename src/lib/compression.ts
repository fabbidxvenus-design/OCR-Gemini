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