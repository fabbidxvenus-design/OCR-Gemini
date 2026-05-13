interface FilePickerWindow extends Window {
  showSaveFilePicker?: (options: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<FileSystemFileHandle>;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareFile(blob: Blob, filename: string): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  const file = new File([blob], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  if ('canShare' in navigator && !navigator.canShare({ files: [file] })) {
    return false;
  }

  try {
    await navigator.share({
      files: [file],
      title: 'OCR Export',
      text: `Exported from OCR App`,
    });
    return true;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return false;
    }
    return false;
  }
}

async function saveFileWithPicker(blob: Blob, filename: string): Promise<boolean> {
  const win = window as FilePickerWindow;
  if (!win.showSaveFilePicker) {
    return false;
  }

  try {
    const handle = await win.showSaveFilePicker({
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
    return true;
  } catch {
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
    return;
  }

  // 2. Try File System Access API (Chrome desktop/Android)
  const saved = await saveFileWithPicker(blob, filename);
  if (saved) {
    return;
  }

  // 3. Fallback: trigger download
  triggerDownload(blob, filename);
}
