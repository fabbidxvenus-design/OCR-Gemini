# OpenRouter Integration Pattern

## Rule

Use OpenRouter chat completions API with multi-key fallback and exponential backoff retry for OCR requests.

**Why:** OpenRouter provides unified access to Gemini models with built-in rate limiting and failover. Multi-key fallback prevents single-key quota exhaustion from blocking the entire app. Exponential backoff handles transient 503/429 errors without hammering the API.

**How to apply:**

- Store multiple API keys in `VITE_OPENROUTER_API_KEY_1`, `VITE_OPENROUTER_API_KEY_2`, etc.
- Try keys sequentially; if key N fails with retryable error (503, 429), move to key N+1.
- For each key, retry up to 3 times with exponential backoff: `2^attempt * 1000ms`.
- Track which key succeeded via `apiKeyIndex` in scan record for billing attribution.
- Non-retryable errors (401, 404) should fail immediately without trying next key.

## Code Example

```typescript
// src/lib/gemini.ts pattern
const API_KEYS = [
  import.meta.env.VITE_OPENROUTER_API_KEY_1,
  import.meta.env.VITE_OPENROUTER_API_KEY_2,
].filter(Boolean);

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('503') ||
        error.message.includes('429') ||
        error.message.includes('RATE_LIMIT')
      )) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  return fn(); // Final attempt
}

// Try each key in sequence
for (let i = 0; i < API_KEYS.length; i++) {
  try {
    const result = await retryWithBackoff(() => makeApiRequest(API_KEYS[i], i + 1, data));
    return result;
  } catch (error) {
    if (error.message.includes('INVALID_API_KEY')) {
      throw error; // Don't try next key for auth failures
    }
    lastError = error;
  }
}
throw lastError;
```

## Exceptions

- If all keys fail with non-retryable errors, surface error to user immediately.
- If user explicitly selects a model tier that requires a specific key, skip fallback logic.
