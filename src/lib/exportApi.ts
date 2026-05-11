export const exportApi = {
  exportSingle: async (accessToken: string, scanId: string): Promise<Blob> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001'}/api/export/scans/${scanId}.xlsx`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  },

  exportMultiple: async (accessToken: string, scanIds: string[]): Promise<Blob> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001'}/api/export/scans.xlsx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ids: scanIds }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  },
};
