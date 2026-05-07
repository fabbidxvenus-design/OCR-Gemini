# TIP-020: OCR Performance Optimization (<1s)

## HEADER
- TIP-ID: TIP-020
- Project: OCR Gemini Mobile Web
- Module: Performance / API Integration
- Priority: P2
- Depends on: TIP-019
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript + OpenRouter API
- Key files to read first:
  - `src/lib/gemini.ts` (current OCR implementation)
  - `src/lib/compression.ts` (image compression)
  - `src/App.tsx` (CameraPage component)
- Patterns: Parallel processing, streaming responses, aggressive caching

## APPLICABLE STANDARDS
- none

## TASK
Optimize OCR processing time từ ~3-5s xuống <1s bằng cách: (1) giảm kích thước ảnh trước khi gửi, (2) sử dụng streaming response, (3) cache prompt, (4) parallel processing cho UI updates.

## SPECIFICATIONS
### Business Rules
1. **Target latency:** <1s từ khi nhấn "Xác nhận" đến khi hiển thị kết quả đầu tiên
2. **Image optimization:** Resize ảnh xuống max 800px (width/height) trước khi gửi API
3. **Streaming:** Sử dụng streaming response để hiển thị kết quả ngay khi có (không đợi full response)
4. **Prompt caching:** Cache OCR prompt để giảm input tokens
5. **Progressive rendering:** Hiển thị từng field ngay khi parse được (không đợi full JSON)

### Performance Targets
| Metric | Current | Target |
|--------|---------|--------|
| Image compression | ~500ms | <200ms |
| API call | ~3-4s | <800ms |
| JSON parsing | ~100ms | <50ms |
| Total (end-to-end) | ~4-5s | <1s |

### Optimization Strategies

#### 1. Aggressive Image Compression
```typescript
// src/lib/compression.ts
export async function compressImageForOCR(blob: Blob): Promise<Blob> {
  const MAX_DIMENSION = 800; // Giảm từ 1920 xuống 800
  const QUALITY = 0.7; // Giảm từ 0.85 xuống 0.7
  
  // Resize + compress aggressive
  // Target: <200ms, output <100KB
}
```

#### 2. Streaming Response (OpenRouter supports SSE)
```typescript
// src/lib/gemini.ts
export async function processOCRStreaming(
  imageBlob: Blob,
  onChunk: (partialData: Partial<OCRResponse>) => void
): Promise<OCRResponse> {
  // Use fetch with stream: true
  // Parse JSON incrementally as chunks arrive
  // Call onChunk() for each parsed field
}
```

#### 3. Prompt Caching (OpenRouter supports prompt caching)
```typescript
// Cache OCR_PROMPT to reduce input tokens
const requestBody = {
  model: MODEL,
  messages: [...],
  // Enable prompt caching
  cache_control: {
    type: "ephemeral"
  }
};
```

#### 4. Progressive UI Updates
```typescript
// src/App.tsx - CameraPage
const [partialResult, setPartialResult] = useState<Partial<OCRResponse>>({});

await processOCRStreaming(blob, (chunk) => {
  setPartialResult(prev => ({ ...prev, ...chunk }));
  // UI updates immediately as each field arrives
});
```

### Error Handling
- Nếu streaming fails → fallback về non-streaming
- Nếu compression quá lâu (>500ms) → skip resize, gửi ảnh gốc
- Nếu partial JSON invalid → buffer thêm chunks rồi retry parse

## ACCEPTANCE CRITERIA
- Given **Ảnh 2MB** When **Compress** Then **Output <100KB trong <200ms**
- Given **API call** When **Streaming enabled** Then **First chunk arrives trong <500ms**
- Given **Streaming response** When **Parse incrementally** Then **UI updates mỗi 100-200ms**
- Given **Full flow** When **Chụp → OCR → Display** Then **Total time <1s (P95)**
- Given **Streaming fails** When **Fallback** Then **Non-streaming vẫn hoạt động**

## CONSTRAINTS
- DO NOT: Thay đổi OCR prompt logic (giữ nguyên accuracy)
- DO NOT: Skip compression hoàn toàn (cần balance quality vs speed)
- DO NOT: Cache OCR results (mỗi ảnh là unique)
- REUSE: Existing retry logic, error handling
- SKIP: Server-side caching (out of scope cho POC)

## IMPLEMENTATION STEPS

### 1. Optimize Image Compression
```typescript
// src/lib/compression.ts
export async function compressImageForOCR(blob: Blob): Promise<Blob> {
  const img = await createImageBitmap(blob);
  const MAX_DIM = 800;
  
  let { width, height } = img;
  if (width > MAX_DIM || height > MAX_DIM) {
    const scale = MAX_DIM / Math.max(width, height);
    width *= scale;
    height *= scale;
  }
  
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
}
```

### 2. Add Streaming Support
```typescript
// src/lib/gemini.ts
export async function processOCRStreaming(
  imageBlob: Blob,
  onChunk: (partial: Partial<OCRResponse>) => void
): Promise<OCRResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { ... },
    body: JSON.stringify({
      ...requestBody,
      stream: true // Enable streaming
    })
  });
  
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Parse SSE format: "data: {...}\n\n"
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = line.slice(6);
        const chunk = JSON.parse(json);
        const content = chunk.choices?.[0]?.delta?.content || '';
        
        // Try parse partial JSON
        const partial = extractPartialJSON(content);
        if (partial) {
          onChunk(partial);
        }
      }
    }
  }
  
  // Return final result
  return extractJSON(buffer);
}

function extractPartialJSON(text: string): Partial<OCRResponse> | null {
  // Parse incomplete JSON (e.g., {"title": "INV", "fields": [{"field":)
  // Return what's parseable so far
}
```

### 3. Update CameraPage for Progressive Rendering
```typescript
// src/App.tsx
const [partialOCR, setPartialOCR] = useState<Partial<OCRResponse>>({});

const handleConfirm = async () => {
  setIsProcessing(true);
  setProgress('Đang nén ảnh...');
  
  const compressedBlob = await compressImageForOCR(capturedImage.blob);
  setProgress('Đang xử lý OCR...');
  
  try {
    await processOCRStreaming(compressedBlob, (chunk) => {
      setPartialOCR(prev => ({ ...prev, ...chunk }));
      // Show partial results immediately
    });
  } catch {
    // Fallback to non-streaming
    const result = await processOCR(compressedBlob);
    setPartialOCR(result.structured);
  }
  
  // Save and navigate
};
```

### 4. Add Performance Monitoring
```typescript
// src/lib/performance.ts
export function measureOCRPerformance() {
  const marks = {
    compressionStart: performance.now(),
    compressionEnd: 0,
    apiStart: 0,
    firstChunk: 0,
    apiEnd: 0,
    parseEnd: 0
  };
  
  return {
    markCompressionEnd: () => marks.compressionEnd = performance.now(),
    markAPIStart: () => marks.apiStart = performance.now(),
    markFirstChunk: () => marks.firstChunk = performance.now(),
    markAPIEnd: () => marks.apiEnd = performance.now(),
    getMetrics: () => ({
      compression: marks.compressionEnd - marks.compressionStart,
      timeToFirstChunk: marks.firstChunk - marks.apiStart,
      totalAPI: marks.apiEnd - marks.apiStart,
      total: marks.apiEnd - marks.compressionStart
    })
  };
}
```

## TESTING CHECKLIST
- [ ] Compression <200ms với ảnh 2-5MB
- [ ] Output image <100KB
- [ ] First chunk arrives <500ms
- [ ] UI updates mỗi 100-200ms khi streaming
- [ ] Total time <1s (test 10 lần, P95)
- [ ] Fallback hoạt động khi streaming fails
- [ ] OCR accuracy không giảm (so với baseline)
- [ ] Build pass

## PERFORMANCE BASELINE
Đo trước khi optimize (current):
```
Compression: ~500ms
API call: ~3-4s
Parsing: ~100ms
Total: ~4-5s
```

Target sau optimize:
```
Compression: <200ms
Time to first chunk: <500ms
Progressive updates: every 100-200ms
Total: <1s
```

## RISKS & MITIGATIONS
| Risk | Impact | Mitigation |
|------|--------|------------|
| Streaming không stable | HIGH | Fallback to non-streaming |
| Aggressive compression giảm accuracy | MEDIUM | A/B test với 800px vs 1920px |
| Partial JSON parsing phức tạp | MEDIUM | Buffer + retry parse |
| OpenRouter không support streaming | HIGH | Check docs trước, có fallback |

## NOTES
- OpenRouter có thể không support streaming cho tất cả models → verify trước
- Nếu streaming không available, focus vào compression + prompt caching
- Trade-off: Speed vs Accuracy → cần test với real data
- P95 <1s là aggressive target, có thể cần adjust dựa trên test results