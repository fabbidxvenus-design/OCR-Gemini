/**
 * File save/share utilities for mobile browsers.
 * Extracted from excel.ts so it can be reused by API-based export.
 */

function triggerDownload(blob: Blob, filename: string): void {
  console.log('[Download] Attempting download:', filename, blob.size, 'bytes');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  console.log('[Download] Download triggered');
}

async function shareFile(blob: Blob, filename: string): Promise<boolean> {
  console.log('[Share] Attempting to share file:', filename, blob.size, 'bytes');

  if (!navigator.share) {
    console.log('[Share] navigator.share not supported');
    return false;
  }

  const file = new File([blob], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  if ('canShare' in navigator && !navigator.canShare({ files: [file] })) {
    console.log('[Share] navigator.canShare returns false');
    return false;
  }

  try {
    await navigator.share({
      files: [file],
      title: 'OCR Export',
      text: `Exported from OCR App`,
    });
    console.log('[Share] Share API success');
    return true;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return false;
    }
    console.log('[Share] Share API failed, falling back to download:', (err as Error).message);
    return false;
  }
}

async function saveFileWithPicker(blob: Blob, filename: string): Promise<boolean> {
  console.log('[Picker] Attempting file picker:', filename);

  if (!('showSaveFilePicker' in window)) {
    console.log('[Picker] showSaveFilePicker not supported');
    return false;
  }

  try {
    const handle = await (window as unknown as { showSaveFilePicker: (options: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: 'Excel Files',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    console.log('[Picker] File picker success');
    return true;
  } catch (err) {
    console.log('[Picker] File picker cancelled or failed:', err);
    return false;
  }
}

/**
 * Save or share a file blob on mobile browsers.
 * Priority: Web Share API > File Picker > Download
 */
export async function saveOrShareFile(blob: Blob, filename: string): Promise<void> {
  if (blob.size === 0) {
    throw new Error('File Excel trả về không hợp lệ');
  }

  // 1. Try Web Share API (iOS/Android with file support)
  const shared = await shareFile(blob, filename);
  if (shared) {
    console.log('[FileSave] Export successful via share:', filename);
    return;
  }

  // 2. Try File System Access API (Chrome desktop/Android)
  const saved = await saveFileWithPicker(blob, filename);
  if (saved) {
    console.log('[FileSave] Export successful via file picker:', filename);
    return;
  }

  // 3. Fallback: trigger download
  triggerDownload(blob, filename);
  console.log('[FileSave] Export successful via download:', filename);
}
