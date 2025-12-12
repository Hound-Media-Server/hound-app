const BASE_URL = 'http://10.0.2.2:8000/api/v1';

type ApiResponse<T> = T; 
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50Ijoid2ViIiwiZXhwIjoxNzY2MTUzOTI0fQ.K3j3qVyLtdewPHzxFSKeAI4D8XZ12YqKVAw7pRoWUvE"

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `API Error: ${response.status}`);
  }
  return response.json() as ApiResponse<T>;
}