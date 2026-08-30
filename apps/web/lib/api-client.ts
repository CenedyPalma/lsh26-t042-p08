const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorData: any;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText };
    }
    throw new Error(
      errorData?.error?.message ||
        errorData?.message ||
        `HTTP ${res.status}: ${res.statusText}`
    );
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
