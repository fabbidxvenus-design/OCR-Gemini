# TIP-022: Ultra-Fast OCR Pipeline (<1s Target)

## HEADER
- TIP-ID: TIP-022
- Project: OCR Gemini Mobile Web
- Module: Performance / End-to-End Optimization
- Priority: P0
- Depends on: TIP-020 (đã có compressImageForOCR)
- Estimated: L

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript + OpenRouter API
- Key files to read first:
  - `src/App.tsx` (CameraPage - main flow)
  - `src/lib/gemini.ts` (current OCR)
  - `src/lib/compression.ts` (TIP-020: compressImageForOCR)
  - `index.html` (preload hints)
- Patterns: Preloading, parallel execution, minimal UI updates

## APPLICABLE STANDARDS
- none

## TASK
Đạt end-to-end latency <1s từ khi nhấn "Xác nhận" đến khi hiển thị kết quả OCR. Tối ưu tất cả các bước: preload, compression, API call, parsing, save.

## SPECIFICATIONS

### Performance Budget Breakdown (Total: <1000ms)

| Step | Current | Target | Optimizations |
|------|---------|--------|---------------|
| Preload libs | ~0ms | 0ms (preloaded) | Preload browser-image-compression |
| Pre-connect API | ~0ms | 0ms (preconnect) | Add preconnect to OpenRouter |
| Image compression | ~500ms | <150ms | compressImageForOCR (TIP-020) |
| API call | ~2000-3000ms | <600ms | Smaller image, cached prompt |
| Response parsing | ~50ms | <20ms | Direct JSON parse |
| IndexedDB save | ~100ms | <50ms | Async, non-blocking |
| UI render | ~100ms | <50ms | Minimize re-renders |
| **TOTAL** | **~3-4s** | **<1000ms** | |

### Optimization Strategies

#### 1. Preload Critical Resources

```html
<!-- index.html - Add preload hints -->
<link rel="preconnect" href="https://openrouter.ai" />
<link rel="dns-prefetch" href="https://openrouter.ai" />

<!-- Preload browser-image-compression library -->
<link rel="modulepreload" href="/node_modules/browser-image-compression/dist/index.mjs" />
```

Hoặc lazy-load ngay khi app start:
```typescript
// src/App.tsx - Preload on mount
useEffect(() => {
  // Preload compression library
  import('browser-image-compression').catch(() => {});
}, []);
```

#### 2. Pre-connect to OpenRouter API

```typescript
// index.html - Add preconnect
<link rel="preconnect" href="https://openrouter.ai" crossorigin />
<link rel="preconnect" href="https://openrouter.ai/api/v1" />
```

#### 3. Reduce Image Size Further (<50KB)

```typescript
// src/lib/compression.ts - Ultra aggressive
export async function compressImageUltraFast(blob: Blob): Promise<Blob> {
  const img = await createImageBitmap(blob);

  // Aggressive resize: 640px max
  let width = img.width;
  let height = img.height;
  const MAX = 640; // Reduced from 800

  if (width > MAX || height > MAX) {
    const scale = MAX / Math.max(width, height);
    width *= scale;
    height *= scale;
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  // Lower quality for speed: 0.6 (reduced from 0.7)
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.6 });
}
```

#### 4. Simplify Prompt for Speed

Current prompt: ~500 tokens
Optimized prompt: ~200 tokens

```typescript
// src/lib/gemini.ts - Simplified prompt
const OCR_PROMPT = `OCR hóa đơn. Trả về JSON:
{title, fields:[{field,value,conf}], sizes:[{size,qty}], raw_text, notes:[]}
Đọc tất cả thông tin. Confidence: high/medium/low.`;

// Remove examples and detailed rules for faster parsing
```

#### 5. Parallel Processing

```typescript
// src/App.tsx - CameraPage
const handleConfirm = async () => {
  if (!capturedImage) return;

  setIsProcessing(true);

  try {
    // Step 1: Compress + Prepare request (parallel)
    const [compressedBlob] = await Promise.all([
      compressImageUltraFast(capturedImage.blob),
      // Other prep work can go here
    ]);

    // Step 2: OCR call
    const ocrResult = await processOCR(compressedBlob);

    // Step 3: Save + Navigate (parallel)
    const scanId = await createScan({...}); // Could be async

    navigate(`/ocr-result/${scanId}`);

  } catch (err) {
    // Error handling
  }
};
```

#### 6. Reduce UI Overhead

```typescript
// Disable progress text updates during compression
const handleConfirm = async () => {
  setIsProcessing(true);
  // Don't update progress - just show spinner

  try {
    const compressedBlob = await compressImageUltraFast(capturedImage.blob);
    // No intermediate progress update
    const ocrResult = await processOCR(compressedBlob);
    const scanId = await createScan({...});

    // Navigate immediately
    navigate(`/ocr-result/${scanId}`);
  } catch (err) {
    // Handle error
  }
};
```

#### 7. Use Faster IndexedDB Operations

```typescript
// src/hooks/useScans.ts - Optimize createScan
export async function createScan(data: ScanInput): Promise<string> {
  const id = crypto.randomUUID();

  // Non-blocking write
  db.scans.add({
    id,
    ...data,
  });

  // Return immediately - don't wait for write to complete
  return id;
}
```

#### 8. Add Performance Measurement

```typescript
// src/lib/perf.ts
export const perf = {
  start: performance.now(),
  compression: 0,
  apiCall: 0,
  parse: 0,
  save: 0,

  mark(name: string) {
    this[name] = performance.now() - this.start;
    console.log(`[Perf] ${name}: ${this[name].toFixed(0)}ms`);
  },

  getTotal() {
    return performance.now() - this.start;
  }
};
```

```typescript
// Usage in CameraPage
const handleConfirm = async () => {
  const id = crypto.randomUUID();
  perf.start = performance.now();

  const compressedBlob = await compressImageUltraFast(capturedImage.blob);
  perf.mark('compression');

  const ocrResult = await processOCR(compressedBlob);
  perf.mark('api');

  await createScan({ id, ... });
  perf.mark('save');

  console.log(`[Perf] TOTAL: ${perf.getTotal().toFixed(0)}ms`);

  navigate(`/ocr-result/${id}`);
};
```

#### 9. Server-Side Option (Future)

Nếu client-side vẫn không đủ:
- Deploy lightweight backend (Edge function)
- Dùng Cloudflare Workers hoặc Vercel Edge Functions
- Latency có thể giảm 50%+ vì:
  - Không gửi ảnh qua network (server gần OpenRouter)
  - Cache prompt ở server

## ACCEPTANCE CRITERIA

- Given **User nhấn "Xác nhận"** When **OCR flow completes** Then **Total time <1s (P95, 10 lần test)**
- Given **Compression** When **Process 2-5MB image** Then **Output <50KB trong <150ms**
- Given **API call** When **Send compressed image** Then **Response <600ms**
- Given **Full flow** When **Chụp → Xử lý → Kết quả** Then **User thấy kết quả trong <1s**
- Given **Performance budget** When **Breakdown** Then **Compression <150ms, API <600ms, Parse <20ms, Save <50ms, Render <50ms**

## CONSTRAINTS
- DO NOT: Giảm quality OCR xuống mức không đọc được
- DO NOT: Skip compression hoàn toàn (API limit concerns)
- DO NOT: Bỏ error handling
- REUSE: Existing compressImageForOCR từ TIP-020
- REUSE: Existing processOCR function
- SKIP: Server-side implementation (không phải POC nữa)

## IMPLEMENTATION STEPS

### Step 1: Preload + Preconnect
- Add `<link rel="preconnect">` to index.html
- Add module preload for browser-image-compression

### Step 2: Ultra-Fast Compression
- Update compressImageForOCR: 640px, quality 0.6
- Target: <150ms

### Step 3: Simplify Prompt
- Reduce OCR_PROMPT từ ~500 tokens xuống ~200 tokens
- Remove examples, keep essential rules

### Step 4: Remove Progress Updates
- Không update progress text giữa chừng
- Chỉ show spinner

### Step 5: Optimize IndexedDB
- Non-blocking write
- Return id immediately

### Step 6: Add Performance Measurement
- Log timing cho mỗi step
- Display in console for debugging

### Step 7: Test + Measure
- Test 10 lần, tính P95
- Adjust optimizations nếu cần

## TESTING CHECKLIST
- [ ] Preload browser-image-compression on app start
- [ ] Preconnect to OpenRouter works
- [ ] Compression output <50KB, time <150ms
- [ ] API call response <600ms
- [ ] Total time <1s (P95 over 10 tests)
- [ ] OCR accuracy acceptable (so sánh với baseline)
- [ ] Build pass

## RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| Aggressive compression giảm accuracy | HIGH | Test với real invoices, A/B test |
| API timeout với ảnh nhỏ hơn | MEDIUM | Có fallback - retry với ảnh lớn hơn |
| P95 không đạt 1s | MEDIUM | Cần server-side option |
| OpenRouter latency cao | HIGH | Preconnect, cached prompt |

## MEASUREMENT PROTOCOL

```javascript
// Console output example:
[Perf] compression: 120ms
[Perf] api: 580ms
[Perf] save: 30ms
[Perf] TOTAL: 780ms ✓ <1s target
```

Target: P95 < 1000ms (95% requests trong <1s)