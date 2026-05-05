import type { OCRResponse, TokenUsage } from '@/db/schema';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-exp:free';

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

// Vietnamese OCR prompt
const OCR_PROMPT = `Bạn là một chuyên gia OCR chuyên đọc hóa đơn và nhãn dán tiếng Việt.

Nhiệm vụ: Trích xuất thông tin từ hình ảnh hóa đơn và trả về JSON.

Hãy trích xuất:
1. title: Tiêu đề hóa đơn (VD: "INVOICE #12345", "HÓA ĐƠN GTGT")
2. fields: Mảng các trường thông tin, mỗi trường có field (tên trường) và value (giá trị), confidence (high/medium/low)
3. sizes: Bảng size với size (tên size) và quantity (số lượng)
4. raw_text: Văn bản gốc từ OCR
5. notes: Mảng các ghi chú đặc biệt

Quy tắc:
- Trả về JSON hợp lệ, không có text khác
- Nếu không đọc được, đặt giá trị là empty array hoặc empty string
- Confidence: high (>90%), medium (70-90%), low (<70%)
- Trích xuất tất cả thông tin size từ bảng size trên hóa đơn
- Ghi chú: ghi lại các điểm bất thường ( VD: thiếu thông tin, mờ, lệch)

Ví dụ output:
{
  "title": "INVOICE #12345",
  "fields": [
    {"field": "Số hóa đơn", "value": "12345", "confidence": "high"},
    {"field": "Ngày", "value": "2024-01-15", "confidence": "high"}
  ],
  "sizes": [
    {"size": "M", "quantity": 10},
    {"size": "L", "quantity": 15}
  ],
  "raw_text": "INVOICE #12345\nSố hóa đơn: 12345",
  "notes": ["Hóa đơn rõ ràng, không có bất thường"]
}`;

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error && (error.message.includes('503') || error.message.includes('429'))) {
        // Service unavailable or rate limit - wait with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[OpenRouter] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  return fn(); // Final attempt
}

function extractJSON(text: string): OCRResponse | null {
  // Try to find JSON in the response
  // First, try to find JSON block
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|(\{[\s\S]*\})/);
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[2];
      return JSON.parse(jsonStr);
    } catch {
      // Try regex extraction as fallback
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      try {
        return JSON.parse(cleanText);
      } catch {
        // Return null if all parsing fails
        return null;
      }
    }
  }
  return null;
}

export async function processOCR(imageBlob: Blob): Promise<{
  structured: OCRResponse;
  tokenUsage: TokenUsage;
}> {
  // Convert blob to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
  reader.readAsDataURL(imageBlob);

  const base64Data = await base64Promise;

  const requestBody = {
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: base64Data
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

  const response = await retryWithBackoff(async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://ocr-gemini-amber.vercel.app',
        'X-Title': 'OCR Gemini Mobile Web'
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      let errorMessage = `API Error ${res.status}`;

      // Parse error for common issues
      if (res.status === 429) {
        errorMessage = 'Đã hết quota API. Vui lòng đợi hoặc nâng cấp plan.';
      } else if (res.status === 401) {
        errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại VITE_OPENROUTER_API_KEY.';
      } else if (res.status === 503) {
        errorMessage = 'Dịch vụ tạm thời quá tải. Đang thử lại...';
      }

      throw new Error(errorMessage);
    }

    return res.json() as Promise<OpenRouterResponse>;
  });

  // Extract response text
  const responseText = response.choices?.[0]?.message?.content || '';
  const raw_text = responseText;

  // Parse JSON from response
  const ocrStructured = extractJSON(responseText);

  // Calculate token usage
  const inputTokens = response.usage?.prompt_tokens || 0;
  const outputTokens = response.usage?.completion_tokens || 0;

  // OpenRouter pricing for Gemini 2.0 Flash Exp (free)
  const cost = 0; // Free model

  return {
    structured: {
      title: ocrStructured?.title,
      fields: ocrStructured?.fields || [],
      sizes: ocrStructured?.sizes || [],
      raw_text,
      notes: ocrStructured?.notes || [],
    },
    tokenUsage: {
      input: inputTokens,
      output: outputTokens,
      cost,
    },
  };
}