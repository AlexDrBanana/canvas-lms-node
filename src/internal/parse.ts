import { safeJSON } from './utils/values.js';

export interface APIResponseProps {
  response: Response;
  options: import('./request-options.js').FinalRequestOptions;
  controller: AbortController;
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  const json = safeJSON(text);
  if (json !== undefined) return json as T;

  return text as unknown as T;
}
