import type { OCRResponse, TokenUsage } from '@/db/schema';
import { getModelConfig } from './models';
import { db } from '@/db/schema';

// Get API keys from environment
const API_KEYS = [
  import.meta.env.VITE_OPENROUTER_API_KEY_1 as string,
  import.meta.env.VITE_OPENROUTER_API_KEY_2 as string,
].filter(Boolean);

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

interface OpenRouterErrorResponse {
  error?: {
    message?: string;
    code?: number | string;
  };
}

// Track which API key was used for billing
let lastUsedApiKeyIndex = 1;
export function getLastUsedApiKeyIndex(): number {
  return lastUsedApiKeyIndex;
}

// Load selected model tier from settings
async function getSelectedModelTier(): Promise<'free' | 'default' | 'high'> {
  try {
    const settings = await db.settings.get('app-settings');
    return settings?.selectedModelTier || 'default';
  } catch (error) {
    console.error('[OCR] Failed to load settings, using default tier:', error);
    return 'default';
  }
}

// Make API request with a specific API key
async function makeApiRequest(
  apiKey: string,
  apiKeyIndex: number,
  base64Data: string,
  tier: 'free' | 'default' | 'high'
): Promise<{ response: OpenRouterResponse; apiKeyIndex: number }> {
  const modelConfig = getModelConfig(tier);

  const requestBody = {
    model: modelConfig.model,
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
            text: modelConfig.prompt
          }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 2048
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ocr-gemini-amber.vercel.app',
      'X-Title': 'OCR App'
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    let openRouterMessage: string;
    try {
      const errorBody = (await res.json()) as OpenRouterErrorResponse;
      openRouterMessage = errorBody.error?.message || '';
    } catch {
      openRouterMessage = await res.text().catch(() => '');
    }

    let errorMessage = openRouterMessage
      ? `OpenRouter API Error ${res.status}: ${openRouterMessage}`
      : `OpenRouter API Error ${res.status}`;

    // Parse error for common issues
    if (res.status === 429) {
      errorMessage = 'RATE_LIMIT_EXCEEDED';
    } else if (res.status === 401) {
      errorMessage = 'INVALID_API_KEY';
    } else if (res.status === 404 && openRouterMessage) {
      errorMessage = `Model OpenRouter không khả dụng: ${openRouterMessage}`;
    } else if (res.status === 503) {
      errorMessage = 'SERVICE_UNAVAILABLE';
    }

    throw new Error(errorMessage);
  }

  lastUsedApiKeyIndex = apiKeyIndex;
  return {
    response: await res.json() as OpenRouterResponse,
    apiKeyIndex,
  };
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('503') ||
        error.message.includes('429') ||
        error.message.includes('RATE_LIMIT')
      )) {
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

export async function processOCR(
  imageBlob: Blob,
  tierOverride?: 'free' | 'default' | 'high'
): Promise<{
  structured: OCRResponse;
  tokenUsage: TokenUsage;
  apiKeyIndex: number;
  modelTier: 'free' | 'default' | 'high';
}> {
  // Get selected tier from settings or use override
  const tier = tierOverride || await getSelectedModelTier();
  const modelConfig = getModelConfig(tier);

  console.log(`[OCR] Using model tier: ${tier} (${modelConfig.model})`);

  // Convert blob to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
  reader.readAsDataURL(imageBlob);

  const base64Data = await base64Promise;

  // Try API keys in sequence with fallback
  let lastError: Error | null = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKeyIndex = i + 1;
    const apiKey = API_KEYS[i];

    try {
      console.log(`[OCR] Trying API Key ${apiKeyIndex}...`);

      const result = await retryWithBackoff(async () =>
        makeApiRequest(apiKey, apiKeyIndex, base64Data, tier)
      );

      // Extract response text
      const responseText = result.response.choices?.[0]?.message?.content || '';
      const raw_text = responseText;

      // Parse JSON from response
      const ocrStructured = extractJSON(responseText);

      // Calculate token usage
      const inputTokens = result.response.usage?.prompt_tokens || 0;
      const outputTokens = result.response.usage?.completion_tokens || 0;

      const cost = (inputTokens / 1_000_000) * modelConfig.pricing.input +
                   (outputTokens / 1_000_000) * modelConfig.pricing.output;

      console.log(`[OCR] Success with API Key ${result.apiKeyIndex}`);
      console.log(`[OCR] Tokens: ${inputTokens} input, ${outputTokens} output, cost: $${cost.toFixed(6)}`);

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
        apiKeyIndex: result.apiKeyIndex,
        modelTier: tier,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`[OCR] API Key ${apiKeyIndex} failed: ${lastError.message}`);

      // If it's not a retryable error (like invalid API key), don't try next key
      if (lastError.message.includes('INVALID_API_KEY')) {
        throw lastError;
      }
    }
  }

  // All API keys failed
  throw lastError || new Error('Tất cả API keys đều thất bại');
}