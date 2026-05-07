# TIP-007: Gemini API Integration + Retry Logic

## HEADER
- **TIP-ID**: TIP-007
- **Project**: OCR Gemini Mobile Web POC
- **Module**: OCR Processing
- **Priority**: P0
- **Depends on**: TIP-001, TIP-006, TIP-008
- **Estimated**: 8 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Google Gemini API 2.5-flash-lite
- **Key files to read first**: 
  - `BUILDER-HANDOFF.md` (Gemini API patterns, retry logic from Python scripts)
  - `src/pages/CameraPage.tsx` (will be updated to call OCR)
- **Patterns to follow**: Retry with exponential backoff (from Python scripts), JSON extraction with regex fallback, Vietnamese OCR prompt

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Implement Gemini API integration for OCR processing of Vietnamese invoice labels. Create API client with retry logic (exponential backoff for 503 errors), Vietnamese OCR prompt, and structured JSON response parsing. Handle API errors gracefully with user-friendly messages. Calculate token usage and cost. Save scan results to IndexedDB after successful OCR.

---

## SPECIFICATIONS

### Business Rules

1. **API endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`
2. **API key**: From environment variable `VITE_GEMINI_API_KEY`
3. **Retry logic**: Max 4 retries with exponential backoff (2^attempt seconds) for 503 errors
4. **OCR prompt**: Vietnamese prompt for invoice label extraction
5. **Response format**: Enforce JSON schema via `response_mime_type`
6. **Token counting**: Calculate input/output tokens and cost
7. **Error handling**: User-friendly Vietnamese error messages
8. **Save to DB**: Store scan record in IndexedDB after successful OCR

### Gemini API Client

**src/lib/gemini.ts**:
```typescript
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      inline_data?: {
        mime_type: string;
        data: string;
      };
      text?: string;
    }>;
  }>;
  generationConfig: {
    response_mime_type: string;
    temperature: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface OCRField {
  field: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface OCRSize {
  size: string;
  quantity: number;
}

export interface OCRResponse {
  title: string;
  fields: OCRField[];
  sizes: OCRSize[];
  raw_text: string;
  notes: string[];
}

export interface OCRResult {
  ocrResponse: OCRResponse;
  tokenUsage: {
    input: number;
    output: number;
    cost: number;
  };
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// Pricing (as of 2024): $0.075 per 1M input tokens, $0.30 per 1M output tokens
const COST_PER_1M_INPUT = 0.075;
const COST_PER_1M_OUTPUT = 0.30;

const OCR_PROMPT = `Đọc nội dung trong ảnh và trả về kết quả đã format chuyên nghiệp bằng JSON.

Yêu cầu:
- Chỉ trả về nội dung OCR, không giải thích.
- Giữ đúng ý nghĩa và thứ tự nội dung trong ảnh.
- Nếu có tiêu đề: ghi vào field "title".
- Nếu có bảng: parse thành mảng "sizes" với size và quantity.
- Nếu có nhãn hoặc thông tin cặp: thêm vào mảng "fields".
- Sửa bố cục cho dễ đọc, nhưng không thêm nội dung mới.
- Nếu phần nào không đọc được, ghi [không đọc được].

Return JSON schema:
{
  "title": "",
  "fields": [
    {"field": "Contract No", "value": "", "confidence": "high|medium|low"},
    {"field": "Product Name", "value": "", "confidence": "high|medium|low"},
    {"field": "Item Code", "value": "", "confidence": "high|medium|low"},
    {"field": "CT No", "value": "", "confidence": "high|medium|low"},
    {"field": "Made In", "value": "", "confidence": "high|medium|low"}
  ],
  "sizes": [
    {"size": "M", "quantity": 10},
    {"size": "L", "quantity": 10}
  ],
  "raw_text": "",
  "notes": []
}`;

function getErrorStatus(error: unknown): number | null {
  if (error && typeof error === 'object') {
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    if ('code' in error && typeof error.code === 'number') {
      return error.code;
    }
  }
  const text = String(error);
  if (text.includes('503')) return 503;
  if (text.includes('429')) return 429;
  if (text.includes('404')) return 404;
  if (text.includes('400')) return 400;
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 4
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = getErrorStatus(error);
      if (status !== 503 || attempt === maxRetries) {
        throw error;
      }
      const waitSeconds = Math.pow(2, attempt);
      console.log(`[Gemini] Retry ${attempt}/${maxRetries} after ${waitSeconds}s (503 error)`);
      await sleep(waitSeconds * 1000);
    }
  }
  throw new Error('Max retries exceeded');
}

function extractJSON(text: string): OCRResponse {
  let cleaned = text.trim();
  
  // Remove markdown code blocks
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: extract JSON with regex
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(match[0]);
  }
}

function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * COST_PER_1M_INPUT;
  const outputCost = (outputTokens / 1_000_000) * COST_PER_1M_OUTPUT;
  return inputCost + outputCost;
}

export async function processOCR(imageBlob: Blob): Promise<OCRResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY not found in environment variables');
  }

  // Convert blob to base64
  const base64 = await blobToBase64(imageBlob);
  const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

  const request: GeminiRequest = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: OCR_PROMPT,
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0,
    },
  };

  const response = await retryWithBackoff(async () => {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorText = await res.text();
      const error: any = new Error(`Gemini API error: ${res.status}`);
      error.status = res.status;
      error.details = errorText;
      throw error;
    }

    return res.json();
  });

  const geminiResponse = response as GeminiResponse;

  // Extract OCR result
  const resultText = geminiResponse.candidates[0]?.content?.parts[0]?.text;
  if (!resultText) {
    throw new Error('No response from Gemini API');
  }

  const ocrResponse = extractJSON(resultText);

  // Calculate token usage and cost
  const inputTokens = geminiResponse.usageMetadata?.promptTokenCount || 0;
  const outputTokens = geminiResponse.usageMetadata?.candidatesTokenCount || 0;
  const cost = calculateCost(inputTokens, outputTokens);

  return {
    ocrResponse,
    tokenUsage: {
      input: inputTokens,
      output: outputTokens,
      cost,
    },
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function getErrorMessage(error: unknown): string {
  const status = getErrorStatus(error);
  
  switch (status) {
    case 503:
      return 'Model đang quá tải. Đang thử lại...';
    case 429:
      return 'Đã hết quota API. Vui lòng chờ hoặc kiểm tra API key.';
    case 400:
      return 'Ảnh không hợp lệ hoặc quá lớn.';
    case 404:
      return 'Không tìm thấy model. Vui lòng kiểm tra cấu hình.';
    default:
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return 'Không có kết nối internet. Vui lòng kiểm tra mạng.';
      }
      return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }
}
```

### OCR Hook

**src/hooks/useOCR.ts**:
```typescript
import { useState } from 'react';
import { processOCR, getErrorMessage, type OCRResult } from '@/lib/gemini';
import { createScan } from '@/db/queries';
import type { ScanRecord } from '@/db/schema';

interface UseOCRReturn {
  isProcessing: boolean;
  error: string | null;
  processImage: (imageBlob: Blob, imageDataUrl: string) => Promise<string | null>;
}

export function useOCR(): UseOCRReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (
    imageBlob: Blob,
    imageDataUrl: string
  ): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call Gemini API
      const result: OCRResult = await processOCR(imageBlob);

      // Save to IndexedDB
      const scanRecord: Omit<ScanRecord, 'id'> = {
        timestamp: new Date(),
        imageBlob,
        imageDataUrl,
        ocrRaw: result.ocrResponse.raw_text,
        ocrStructured: result.ocrResponse,
        edited: false,
        tokenUsage: result.tokenUsage,
      };

      const scanId = await createScan(scanRecord);
      
      console.log('[OCR] Success:', {
        scanId,
        tokens: result.tokenUsage,
        fields: result.ocrResponse.fields.length,
      });

      return scanId;
    } catch (err) {
      console.error('[OCR] Error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    processImage,
  };
}
```

### Updated Camera Page with OCR

**src/pages/CameraPage.tsx**:
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CameraView from '@/components/camera/CameraView';
import ImagePreview from '@/components/camera/ImagePreview';
import { useOCR } from '@/hooks/useOCR';
import { Loader2 } from 'lucide-react';

export default function CameraPage() {
  const navigate = useNavigate();
  const { isProcessing, error, processImage } = useOCR();
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

    const scanId = await processImage(capturedImage.blob, capturedImage.dataUrl);
    
    if (scanId) {
      // Navigate to edit page (TIP-010)
      // For now, navigate to history
      navigate('/history');
    }
  };

  if (isProcessing) {
    return (
      <Layout title="Đang xử lý..." showBottomNav={false}>
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-neutral">Đang quét OCR...</p>
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

1. **API key**: Must be present in environment variables
2. **Retry logic**: Max 4 retries with exponential backoff for 503 errors
3. **JSON parsing**: Handle both clean JSON and markdown-wrapped JSON
4. **Token counting**: Calculate input/output tokens and cost
5. **Error messages**: Vietnamese, user-friendly
6. **Save to DB**: Store scan record after successful OCR

### Error Handling

- **503 (Model overloaded)**: Retry with exponential backoff, show "Đang thử lại..."
- **429 (Quota exceeded)**: Show "Đã hết quota API"
- **400 (Bad request)**: Show "Ảnh không hợp lệ hoặc quá lớn"
- **Network error**: Show "Không có kết nối internet"
- **JSON parse error**: Try regex fallback, then show generic error
- **Missing API key**: Show error at startup

---

## ACCEPTANCE CRITERIA

### AC-001: API Key Check
- **Given**: App starts
- **When**: User tries to process OCR
- **Then**:
  - If API key missing, error shows "VITE_GEMINI_API_KEY not found"
  - If API key present, OCR proceeds

### AC-002: OCR Processing
- **Given**: User has captured image and tapped "Xác nhận"
- **When**: OCR processing starts
- **Then**:
  - Loading screen shows with spinner
  - "Đang quét OCR..." message displays
  - BottomNav is hidden

### AC-003: OCR Success
- **Given**: Gemini API returns valid OCR result
- **When**: Processing completes
- **Then**:
  - Scan record is saved to IndexedDB with UUID
  - Token usage is calculated and stored
  - User navigates to /history
  - Console logs success with scanId, tokens, fields count

### AC-004: OCR Response Parsing
- **Given**: Gemini API returns JSON response
- **When**: Response is parsed
- **Then**:
  - JSON is extracted (with or without markdown wrapper)
  - OCRResponse object has title, fields, sizes, raw_text, notes
  - Fields have confidence levels (high/medium/low)

### AC-005: Retry Logic (503 Error)
- **Given**: Gemini API returns 503 error
- **When**: First attempt fails
- **Then**:
  - System waits 2 seconds (2^1)
  - Retries request
  - If fails again, waits 4 seconds (2^2)
  - Max 4 retries before giving up
  - Console logs each retry attempt

### AC-006: Error Handling (429 Quota)
- **Given**: Gemini API returns 429 error
- **When**: Request fails
- **Then**:
  - Error screen shows
  - Message: "Đã hết quota API. Vui lòng chờ hoặc kiểm tra API key."
  - "Thử lại" button is visible

### AC-007: Error Handling (Network)
- **Given**: No internet connection
- **When**: Request fails with network error
- **Then**:
  - Error screen shows
  - Message: "Không có kết nối internet. Vui lòng kiểm tra mạng."
  - "Thử lại" button is visible

### AC-008: Token Usage Calculation
- **Given**: OCR completes successfully
- **When**: Token usage is calculated
- **Then**:
  - Input tokens counted from usageMetadata
  - Output tokens counted from usageMetadata
  - Cost calculated: (input/1M * $0.075) + (output/1M * $0.30)
  - All values stored in scan record

### AC-009: Retry Button
- **Given**: OCR failed with error
- **When**: User taps "Thử lại" button
- **Then**:
  - Error screen closes
  - User returns to ImagePreview
  - Can tap "Xác nhận" to retry OCR

### AC-010: Vietnamese Prompt
- **Given**: Image is sent to Gemini API
- **When**: Request is constructed
- **Then**:
  - Prompt is in Vietnamese
  - Prompt requests JSON format
  - Prompt specifies fields, sizes, raw_text structure
  - response_mime_type is "application/json"
  - temperature is 0

---

## CONSTRAINTS

### DO NOT:
- ❌ Hardcode API key in source code — use environment variable
- ❌ Retry on non-503 errors — only retry 503
- ❌ Use synchronous fetch — use async/await
- ❌ Skip token counting — always calculate cost
- ❌ Show raw error messages to user — use Vietnamese translations
- ❌ Implement backend proxy — client-side only for POC

### REUSE:
- ✅ Retry logic pattern from Python scripts (exponential backoff)
- ✅ JSON extraction pattern from Python scripts (regex fallback)
- ✅ Vietnamese OCR prompt from Python scripts
- ✅ Error status detection from Python scripts
- ✅ IndexedDB queries from TIP-004

### SKIP (out of scope for TIP-007):
- ⏭️ Image compression (will be in TIP-008, but should be done before OCR)
- ⏭️ Edit page navigation (will be in TIP-010)
- ⏭️ OCR result display (will be in TIP-009)
- ⏭️ Backend proxy for API key security
- ⏭️ Rate limiting
- ⏭️ Batch processing

---

## COMPLETION CHECKLIST

- [ ] `src/lib/gemini.ts` created with API client
- [ ] `src/hooks/useOCR.ts` created
- [ ] `src/pages/CameraPage.tsx` updated with OCR integration
- [ ] API key check works
- [ ] OCR processing works (sends image + prompt)
- [ ] Retry logic works (exponential backoff for 503)
- [ ] JSON parsing works (with markdown fallback)
- [ ] Token usage calculation works
- [ ] Error messages display in Vietnamese
- [ ] Scan record saved to IndexedDB
- [ ] Loading state shows during processing
- [ ] Error state shows on failure
- [ ] Retry button works
- [ ] No TypeScript errors
- [ ] No console errors (except expected retry logs)

---

## NOTES FOR BUILDER

1. **API Key**: Copy from existing Python script or create new one at https://aistudio.google.com/apikey
2. **CORS**: Gemini API supports CORS, no proxy needed for POC
3. **Image size**: Should compress image before OCR (TIP-008), but for now test with raw images
4. **Token costs**: Approximate, actual costs may vary slightly
5. **Retry logic**: Only retry 503 (model overloaded), not other errors
6. **Testing**: Test with real invoice images from `D:\scripts\ocr_gemini\` folder

---

*TIP-007 | Generated: 2026-05-05 | Vibecode Kit v5.0*
