const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

type ApiOptions = RequestInit & {
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[]; error?: string };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    return body.message || body.error || `Erro ${response.status}`;
  } catch {
    return `Erro ${response.status}`;
  }
}
