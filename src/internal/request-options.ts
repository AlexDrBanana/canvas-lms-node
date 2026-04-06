import type { HeadersLike } from './headers.js';

export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RequestOptions {
  method?: HTTPMethod;
  path?: string;
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: HeadersLike;
  timeout?: number;
  signal?: AbortSignal;
  maxRetries?: number;
  idempotencyKey?: string;
}

export interface FinalRequestOptions extends RequestOptions {
  method: HTTPMethod;
  path: string;
}
