const API_URL = 'https://overlive.com.br/academy/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('lions-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (url: string) => fetchWithAuth(url, { method: 'GET' }),
  post: (url: string, body?: unknown) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: (url: string, body?: unknown) => fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url: string) => fetchWithAuth(url, { method: 'DELETE' }),
  upload: async (file: File) => {
    const token = localStorage.getItem('lions-token');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || 'Erro no upload');
    }
    return data as { success: boolean; data: { url: string }; message: string };
  },
};
