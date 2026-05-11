# Excel Export Mobile Fallback Chain

## Rule

Try Web Share API → File System Access API → anchor download in sequence for Excel export on mobile browsers.

**Why:** Mobile browsers have inconsistent file download support. Web Share API (iOS/Android) is the most user-friendly for mobile sharing. File System Access API (Chrome Android) provides native save dialog. Anchor download is the universal fallback but has poor UX on some mobile browsers (downloads to hidden folder).

**How to apply:**

1. Generate Excel blob with ExcelJS.
2. Try `navigator.share({ files: [file] })` if `canShare` returns true.
3. If share fails or unavailable, try `showSaveFilePicker()` (Chrome desktop/Android).
4. If picker fails or unavailable, create anchor element with `download` attribute and trigger click.
5. Log each attempt for debugging but don't show error toasts for expected fallbacks.

## Code Example

```typescript
// src/lib/excel.ts pattern
async function shareFile(blob: Blob, filename: string): Promise<boolean> {
  if (navigator.share) {
    const file = new File([blob], filename, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    if ('canShare' in navigator && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'OCR Export' });
        return true;
      } catch (err) {
        // User cancelled or error - silently fallback
        console.log('[Share] Share API failed, falling back:', err.message);
      }
    }
  }
  return false;
}

async function saveFileWithPicker(blob: Blob, filename: string): Promise<boolean> {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'Excel Files', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      console.log('[Picker] File picker cancelled or failed:', err);
      return false;
    }
  }
  return false;
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

// Main export flow
const blob = await workbook.xlsx.writeBuffer();
const shared = await shareFile(blob, filename);
if (shared) return;

const saved = await saveFileWithPicker(blob, filename);
if (saved) return;

triggerDownload(blob, filename);
```

## Exceptions

- For desktop-only admin features, skip Web Share API and go straight to File System Access or download.
- For email attachment workflows, use `mailto:` link with base64 data URI instead of file download.
