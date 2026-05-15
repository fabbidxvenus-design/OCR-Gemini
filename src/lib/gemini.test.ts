import { beforeEach, describe, expect, it, vi } from 'vitest';

const OCR_RESPONSE = {
  ocrRaw: '商品名 VES 529CT',
  ocrStructured: {
    title: 'Mock OCR Result',
    fields: [{ field: '商品名', value: 'VES 529CT', confidence: 'high', category: 'main' }],
    sizes: [],
    rawText: '商品名 VES 529CT',
    notes: [],
  },
  tokenUsage: { input: 10, output: 20, cost: 0.001, model: 'mock' },
  apiKeyIndex: 1,
};

function mockFileReader(): void {
  class MockFileReader {
    result: string | null = null;
    onloadend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    readAsDataURL(): void {
      this.result = 'data:image/png;base64,abc123';
      this.onloadend?.();
    }
  }

  vi.stubGlobal('FileReader', MockFileReader);
}

async function importGemini() {
  vi.resetModules();
  return import('./gemini');
}

describe('processOCR strategy', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    localStorage.clear();
    mockFileReader();
  });

  it('uses the backend OCR proxy by default', async () => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { accessToken: 'test-token', isAuthenticated: true },
      version: 0,
    }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(input.toString()).toContain('/api/ocr/process');
      expect(init?.body?.toString()).toContain('imageBase64');
      return new Response(JSON.stringify({ success: true, data: OCR_RESPONSE }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { processOCR } = await importGemini();
    const result = await processOCR(new Blob(['image'], { type: 'image/png' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.structured.fields?.[0]?.value).toBe('VES 529CT');
  });

  it('uses direct Gemini when the feature flag is enabled', async () => {
    vi.stubEnv('VITE_USE_DIRECT_GEMINI', 'true');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-gemini-key');
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(input.toString()).toContain('generativelanguage.googleapis.com');
      expect(input.toString()).not.toContain('test-gemini-key');
      expect(init?.body?.toString()).not.toContain('test-gemini-key');
      expect(init?.body?.toString()).toContain('inline_data');
      expect(init?.body?.toString()).toContain('mime_type');
      expect(init?.body?.toString()).toContain('response_mime_type');
      expect(init?.body?.toString()).not.toContain('inlineData');
      expect(init?.body?.toString()).not.toContain('responseMimeType');
      expect((init?.headers as Record<string, string>)['x-goog-api-key']).toBe('test-gemini-key');
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: JSON.stringify(OCR_RESPONSE.ocrStructured) }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { processOCR } = await importGemini();
    const result = await processOCR(new Blob(['image'], { type: 'image/png' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.apiKeyIndex).toBe(1);
    expect(result.structured.fields?.[0]?.value).toBe('VES 529CT');
  });
});
