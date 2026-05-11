# JSON Extraction from LLM Responses

## Rule

Extract JSON from LLM text responses using regex fallback pattern: try fenced JSON block first, then raw object match.

**Why:** LLMs sometimes wrap JSON in markdown code fences (`\`\`\`json ... \`\`\``), sometimes return bare JSON, and sometimes include explanatory text before/after. A two-stage regex extraction handles all three cases without failing on valid responses.

**How to apply:**

- First, match `\`\`\`json\n(content)\n\`\`\`` or `{...}` patterns.
- If fenced match found, parse the captured group.
- If no fence, try parsing the entire cleaned text (strip fences, trim).
- Return `null` if all parsing fails; caller decides whether to retry or surface error.

## Code Example

```typescript
// src/lib/gemini.ts pattern
function extractJSON(text: string): OCRResponse | null {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|(\{[\s\S]*\})/);
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[2];
      return JSON.parse(jsonStr);
    } catch {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      try {
        return JSON.parse(cleanText);
      } catch {
        return null;
      }
    }
  }
  return null;
}
```

## Exceptions

- If response is guaranteed to be pure JSON (via `response_mime_type: "application/json"` in request), skip regex and parse directly.
- For non-OCR LLM calls with different output schemas, adapt regex to expected structure.
