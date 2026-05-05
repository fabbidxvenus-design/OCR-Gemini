import type { OCRResponse, TokenUsage } from '@/db/schema';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
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
      if (error instanceof Error && error.message.includes('503')) {
        // Service unavailable - wait with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[Gemini] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
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
  const base64Content = base64Data.split(',')[1];

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Content,
            },
          },
          {
            text: OCR_PROMPT,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  const response = await retryWithBackoff(async () => {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `API Error ${res.status}`;

      // Parse error for quota exceeded
      if (res.status === 429) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message?.includes('quota')) {
            errorMessage = 'Đã hết quota API. Vui lòng đợi hoặc sử dụng API key khác.';
          }
        } catch {
          errorMessage = 'Đã hết quota API. Vui lòng thử lại sau.';
        }
      }

      throw new Error(errorMessage);
    }

    return res.json() as Promise<GeminiResponse>;
  });

  // Extract response text
  const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const raw_text = responseText;

  // Parse JSON from response
  const ocrStructured = extractJSON(responseText);

  // Calculate token usage (estimate from Gemini response)
  const inputTokens = response.usageMetadata?.promptTokenCount || 0;
  const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;

  // Gemini 2.5 Flash Lite pricing (approximate)
  const cost = (inputTokens * 0.00001875 + outputTokens * 0.000075) / 1000;

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