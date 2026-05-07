# TIP-019: Migrate to OpenRouter API

## HEADER
- TIP-ID: TIP-019
- Project: OCR Gemini Mobile Web
- Module: API Integration
- Priority: P1
- Depends on: TIP-017
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript
- Key files to read first:
  - `src/lib/gemini.ts` (current Google AI SDK implementation)
  - `.env.example`
- Patterns: OpenRouter unified API (OpenAI-compatible)

## APPLICABLE STANDARDS
- none

## TASK
Migrate từ Google AI REST API sang OpenRouter API để sử dụng Gemini 2.5 Flash Lite thông qua OpenRouter với API key của OpenRouter.

## SPECIFICATIONS
### Business Rules
1. OpenRouter sử dụng OpenAI-compatible API format
2. Model name: `google/gemini-2.5-flash-lite`
3. API endpoint: `https://openrouter.ai/api/v1/chat/completions`
4. Giữ nguyên prompt và response parsing logic
5. Giữ nguyên retry logic và error handling

### API Format
**Request:**
```json
{
  "model": "google/gemini-2.5-flash-lite",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,..."
          }
        },
        {
          "type": "text",
          "text": "OCR prompt..."
        }
      ]
    }
  ],
  "temperature": 0.1,
  "max_tokens": 2048
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "JSON response..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 567,
    "total_tokens": 1801
  }
}
```

### Environment Variables
- Đổi `VITE_GEMINI_API_KEY` → `VITE_OPENROUTER_API_KEY`
- Update `.env.example`

### Error Handling
- 429 (Rate limit) → retry với backoff
- 503 (Service unavailable) → retry với backoff
- 401 (Invalid API key) → thông báo user-friendly
- Network errors → retry logic

## ACCEPTANCE CRITERIA
- Given **OpenRouter API key** When **Chụp ảnh và OCR** Then **Gemini 2.5 Flash Lite xử lý qua OpenRouter**
- Given **API response** When **Parse JSON** Then **Structured data hiển thị đúng**
- Given **Rate limit 429** When **Retry** Then **Exponential backoff hoạt động**
- Given **Invalid API key** When **Call API** Then **Error message rõ ràng**
- Given **Token usage** When **Calculate cost** Then **Pricing đúng với OpenRouter rates**

## CONSTRAINTS
- DO NOT: Thay đổi UI components
- DO NOT: Thay đổi prompt logic
- DO NOT: Thay đổi response parsing (trừ khi format khác)
- REUSE: Existing retry logic, error handling patterns
- SKIP: Không cần support cả 2 providers (chỉ OpenRouter)

## IMPLEMENTATION STEPS

### 1. Update Environment Variables
```env
# .env.example
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_APP_NAME=OCR Gemini Mobile Web
VITE_MAX_IMAGE_SIZE_MB=5
```

### 2. Update `src/lib/gemini.ts`
```typescript
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash-lite';

// Request body format
const requestBody = {
  model: MODEL,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Content}`
          }
        },
        {
          type: 'text',
          text: OCR_PROMPT
        }
      ]
    }
  ],
  temperature: 0.1,
  max_tokens: 2048
};

// Headers
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'HTTP-Referer': 'https://ocr-gemini-amber.vercel.app',
  'X-Title': 'OCR Gemini Mobile Web'
}
```

### 3. Update Response Parsing
```typescript
// OpenRouter response format
const responseText = response.choices?.[0]?.message?.content || '';

// Token usage
const inputTokens = response.usage?.prompt_tokens || 0;
const outputTokens = response.usage?.completion_tokens || 0;

// OpenRouter pricing for Gemini 2.5 Flash Lite
const cost = (inputTokens * 0.00001875 + outputTokens * 0.000075) / 1000;
```

### 4. Update Error Handling
```typescript
if (!res.ok) {
  const errorText = await res.text();
  let errorMessage = `API Error ${res.status}`;

  if (res.status === 429) {
    errorMessage = 'Đã hết quota API. Vui lòng đợi hoặc nâng cấp plan.';
  } else if (res.status === 401) {
    errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại.';
  }

  throw new Error(errorMessage);
}
```

### 5. Update Vercel Environment Variables
- Xóa `VITE_GEMINI_API_KEY`
- Thêm `VITE_OPENROUTER_API_KEY`
- Redeploy

## TESTING CHECKLIST
- [ ] Build pass (`npm run build`)
- [ ] Camera capture hoạt động
- [ ] OCR trả về structured data
- [ ] Error handling hiển thị đúng
- [ ] Token usage tracking chính xác
- [ ] Cost calculation đúng
- [ ] Retry logic hoạt động khi 429/503

## PRICING COMPARISON
| Provider | Model | Input | Output |
|----------|-------|-------|--------|
| Google AI | gemini-2.5-flash-lite | Free tier limited | Free tier limited |
| OpenRouter | google/gemini-2.5-flash-lite | $0.01875/1M tokens | $0.075/1M tokens |

**Lợi ích OpenRouter:**
- Không bị quota limit nghiêm ngặt như Google AI free tier
- Unified API cho nhiều models
- Better rate limits
- Pay-as-you-go pricing