import { beforeEach, describe, expect, it, vi } from 'vitest';
import { scansApi } from '@/lib/scansApi';

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

describe('scansApi thumbnail persistence', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('requests a signed upload URL for scan thumbnails with auth', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      data: {
        uploadUrl: 'https://storage.example.test/upload-token',
        storagePath: 'scans/user-1/thumb.webp',
        expiresAt: '2026-05-15T10:00:00.000Z',
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const result = await scansApi.createScanUploadUrl('access-token', {
      fileName: 'thumb.webp',
      contentType: 'image/webp',
      sizeBytes: 8192,
    });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/scans/upload-url', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ fileName: 'thumb.webp', contentType: 'image/webp', sizeBytes: 8192 }),
    }));
    expect(result).toEqual({
      uploadUrl: 'https://storage.example.test/upload-token',
      storagePath: 'scans/user-1/thumb.webp',
      expiresAt: '2026-05-15T10:00:00.000Z',
    });
  });

  it('rejects upload-url responses with invalid storage path', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      data: {
        uploadUrl: 'https://storage.example.test/upload-token',
        storagePath: 'https://evil.test/not-allowed.jpg',
        expiresAt: '2026-05-15T10:00:00.000Z',
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await expect(scansApi.createScanUploadUrl('access-token', {
      fileName: 'thumb.webp',
      contentType: 'image/webp',
      sizeBytes: 8192,
    })).rejects.toThrow('Dữ liệu từ server không đúng định dạng');
  });

  it('uploads the thumbnail blob through the authenticated server endpoint', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      data: {
        storagePath: 'scans/user-1/thumb.webp',
        expiresAt: '2026-05-15T10:00:00.000Z',
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const thumbnail = new Blob(['thumbnail'], { type: 'image/webp' });

    const result = await scansApi.uploadScanThumbnail('access-token', thumbnail);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/scans/upload', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
      headers: expect.objectContaining({
        Authorization: 'Bearer access-token',
        Accept: 'application/json',
      }),
    }));
    expect(result.storagePath).toBe('scans/user-1/thumb.webp');
  });

  it('sends imageUrl and imageDataUrl when creating scan history', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      data: {
        id: 'scan-1',
        timestamp: '2026-05-15T10:00:00.000Z',
        imageUrl: 'scans/user-1/thumb.webp',
        ocrRaw: 'raw',
        ocrStructured: {
          title: 'Mock OCR',
          fields: [],
          sizes: [],
          rawText: 'raw',
          notes: [],
        },
        tokenUsage: { input: 0, output: 0, cost: 0 },
        apiKeyIndex: 0,
        edited: false,
        modelTier: 'default',
      },
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }));

    await scansApi.createScan('access-token', {
      timestamp: '2026-05-15T10:00:00.000Z',
      imageUrl: 'scans/user-1/thumb.webp',
      imageDataUrl: 'data:image/png;base64,should-send',
      ocrRaw: 'raw',
      ocrStructured: {
        title: 'Mock OCR',
        fields: [],
        sizes: [],
        rawText: 'raw',
        notes: [],
      },
    });

    const [, request] = fetchMock.mock.calls[0];
    const body = JSON.parse(request.body as string);
    expect(body.imageUrl).toBe('scans/user-1/thumb.webp');
    expect(body.imageDataUrl).toBe('data:image/png;base64,should-send');
  });
});
