import { VERSION } from './version.js';
import { readEnv } from './internal/utils/env.js';
import { sleep } from './internal/utils/sleep.js';
import { isAbsoluteURL, validatePositiveInteger, safeJSON } from './internal/utils/values.js';
import { type Logger, type LogLevel, loggerFor, parseLogLevel } from './internal/utils/log.js';
import { buildHeaders, type HeadersLike } from './internal/headers.js';
import type { RequestOptions, FinalRequestOptions } from './internal/request-options.js';
import { parseResponse, type APIResponseProps } from './internal/parse.js';
import { APIPromise } from './core/api-promise.js';
import { LinkPage, PagePromise } from './core/pagination.js';
import * as Errors from './core/error.js';

import { Courses } from './resources/courses.js';
import { Assignments } from './resources/assignments.js';
import { Submissions } from './resources/submissions.js';
import { Users } from './resources/users.js';
import { Enrollments } from './resources/enrollments.js';
import { Files } from './resources/files.js';
import { Groups } from './resources/groups.js';
import { Rubrics } from './resources/rubrics.js';
import { Sections } from './resources/sections.js';
import { Modules } from './resources/modules.js';

export interface ClientOptions {
  /** Canvas API access token. Defaults to process.env['CANVAS_API_KEY']. */
  apiKey?: string | undefined;

  /** Base URL of the Canvas instance, e.g. "https://canvas.instructure.com". Defaults to process.env['CANVAS_BASE_URL']. */
  baseURL?: string | undefined;

  /** Request timeout in milliseconds. @default 60000 (60s) */
  timeout?: number | undefined;

  /** Maximum number of retries for failed requests. @default 2 */
  maxRetries?: number | undefined;

  /** Default per_page for paginated requests. @default 100 */
  perPage?: number | undefined;

  /** Default headers for every request. */
  defaultHeaders?: HeadersLike | undefined;

  /** Default query parameters for every request. */
  defaultQuery?: Record<string, string | undefined> | undefined;

  /** Custom fetch implementation. */
  fetch?: typeof globalThis.fetch | undefined;

  /** Log level. Defaults to process.env['CANVAS_LOG'] or 'warn'. */
  logLevel?: LogLevel | undefined;

  /** Custom logger. Defaults to console. */
  logger?: Logger | undefined;
}

export class CanvasLMS {
  apiKey: string;
  baseURL: string;
  timeout: number;
  maxRetries: number;
  perPage: number;
  logger: Logger;
  logLevel: LogLevel | undefined;

  private fetch: typeof globalThis.fetch;
  private _options: ClientOptions;
  private _defaultHeaders: HeadersLike;
  private _defaultQuery: Record<string, string | undefined> | undefined;

  // --- Resources ---
  courses: Courses;
  assignments: Assignments;
  submissions: Submissions;
  users: Users;
  enrollments: Enrollments;
  files: Files;
  groups: Groups;
  rubrics: Rubrics;
  sections: Sections;
  modules: Modules;

  static DEFAULT_TIMEOUT = 60_000;

  // Error classes accessible from client
  static CanvasLMSError = Errors.CanvasLMSError;
  static APIError = Errors.APIError;
  static APIConnectionError = Errors.APIConnectionError;
  static APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
  static APIUserAbortError = Errors.APIUserAbortError;
  static BadRequestError = Errors.BadRequestError;
  static AuthenticationError = Errors.AuthenticationError;
  static PermissionDeniedError = Errors.PermissionDeniedError;
  static NotFoundError = Errors.NotFoundError;
  static ConflictError = Errors.ConflictError;
  static UnprocessableEntityError = Errors.UnprocessableEntityError;
  static RateLimitError = Errors.RateLimitError;
  static InternalServerError = Errors.InternalServerError;

  constructor(opts: ClientOptions = {}) {
    const apiKey = opts.apiKey ?? readEnv('CANVAS_API_KEY');
    const baseURL = opts.baseURL ?? readEnv('CANVAS_BASE_URL');

    if (!apiKey) {
      throw new Errors.CanvasLMSError(
        'Missing API key. Pass `apiKey` or set the `CANVAS_API_KEY` environment variable.',
      );
    }
    if (!baseURL) {
      throw new Errors.CanvasLMSError(
        'Missing base URL. Pass `baseURL` or set the `CANVAS_BASE_URL` environment variable.',
      );
    }

    this._options = opts;
    this.apiKey = apiKey;
    this.baseURL = baseURL.replace(/\/+$/, '');
    this.timeout = opts.timeout ?? CanvasLMS.DEFAULT_TIMEOUT;
    this.maxRetries = opts.maxRetries ?? 2;
    this.perPage = opts.perPage ?? 100;
    this.logger = opts.logger ?? console;
    this.fetch = opts.fetch ?? globalThis.fetch;
    this._defaultHeaders = opts.defaultHeaders;
    this._defaultQuery = opts.defaultQuery;

    const defaultLogLevel: LogLevel = 'warn';
    this.logLevel = defaultLogLevel;
    this.logLevel =
      parseLogLevel(opts.logLevel, 'ClientOptions.logLevel', this.logger) ??
      parseLogLevel(readEnv('CANVAS_LOG'), "process.env['CANVAS_LOG']", this.logger) ??
      defaultLogLevel;

    // Instantiate resources
    this.courses = new Courses(this);
    this.assignments = new Assignments(this);
    this.submissions = new Submissions(this);
    this.users = new Users(this);
    this.enrollments = new Enrollments(this);
    this.files = new Files(this);
    this.groups = new Groups(this);
    this.rubrics = new Rubrics(this);
    this.sections = new Sections(this);
    this.modules = new Modules(this);
  }

  // --- HTTP Methods ---

  get<T>(path: string, opts?: RequestOptions): APIPromise<T> {
    return this.request<T>({ ...opts, method: 'get', path });
  }

  post<T>(path: string, opts?: RequestOptions): APIPromise<T> {
    return this.request<T>({ ...opts, method: 'post', path });
  }

  put<T>(path: string, opts?: RequestOptions): APIPromise<T> {
    return this.request<T>({ ...opts, method: 'put', path });
  }

  patch<T>(path: string, opts?: RequestOptions): APIPromise<T> {
    return this.request<T>({ ...opts, method: 'patch', path });
  }

  delete<T>(path: string, opts?: RequestOptions): APIPromise<T> {
    return this.request<T>({ ...opts, method: 'delete', path });
  }

  // --- Paginated Requests ---

  getAPIList<Item>(
    path: string,
    opts?: RequestOptions,
  ): PagePromise<Item> {
    const finalOpts: FinalRequestOptions = {
      ...opts,
      method: 'get',
      path,
      query: {
        per_page: String(this.perPage),
        ...(opts?.query as Record<string, string> | undefined),
      },
    };
    return new PagePromise<Item>(this, this._makeRequest(finalOpts, null));
  }

  /** @internal Used by LinkPage to fetch next pages */
  async _requestAPIList<Item>(
    opts: FinalRequestOptions,
  ): Promise<LinkPage<Item>> {
    const props = await this._makeRequest(opts, null);
    const body = (await parseResponse<Item[]>(props.response)) as Item[];
    return new LinkPage<Item>(this, props.response, body, props.options);
  }

  // --- Core Request Pipeline ---

  private request<T>(options: FinalRequestOptions): APIPromise<T> {
    return new APIPromise<T>(
      this._makeRequest(options, null),
      async (props) => parseResponse<T>(props.response),
    );
  }

  private async _makeRequest(
    options: FinalRequestOptions,
    retriesRemaining: number | null,
  ): Promise<APIResponseProps> {
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining === null) {
      retriesRemaining = maxRetries;
    }

    const { url, init, timeout } = this._buildRequest(options);

    const log = loggerFor(this);
    log.debug(`[canvas] ${init.method} ${url}`);

    if (options.signal?.aborted) {
      throw new Errors.APIUserAbortError();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    let response: Response;
    try {
      response = await this.fetch.call(undefined, url, {
        ...init,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (options.signal?.aborted) {
        throw new Errors.APIUserAbortError();
      }
      const isTimeout =
        err instanceof Error &&
        (err.name === 'AbortError' || /timed?\s*out/i.test(err.message));

      if (retriesRemaining > 0) {
        log.info(`[canvas] connection ${isTimeout ? 'timed out' : 'failed'} - retrying, ${retriesRemaining} attempts remaining`);
        return this._retryRequest(options, retriesRemaining, maxRetries);
      }

      if (isTimeout) throw new Errors.APIConnectionTimeoutError();
      throw new Errors.APIConnectionError({ cause: err instanceof Error ? err : undefined });
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle non-success responses
    if (!response.ok) {
      const shouldRetry = this._shouldRetry(response);

      if (retriesRemaining > 0 && shouldRetry) {
        log.info(`[canvas] ${response.status} response - retrying, ${retriesRemaining} attempts remaining`);
        return this._retryRequest(options, retriesRemaining, maxRetries, response.headers);
      }

      const errText = await response.text().catch(() => '');
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? undefined : errText;

      throw Errors.APIError.generate(response.status, errJSON, errMessage, response.headers);
    }

    log.debug(`[canvas] ${response.status} ${url}`);

    return { response, options, controller };
  }

  private _buildRequest(options: FinalRequestOptions): {
    url: string;
    init: RequestInit;
    timeout: number;
  } {
    const { method, path, query, body } = options;

    if (options.timeout !== undefined) {
      validatePositiveInteger('timeout', options.timeout);
    }
    const timeout = options.timeout ?? this.timeout;

    // Build URL
    let url: string;
    if (isAbsoluteURL(path)) {
      url = path;
    } else {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      const prefix = cleanPath.startsWith('/api/') ? '' : '/api/v1';
      url = `${this.baseURL}${prefix}${cleanPath}`;
    }

    // Append query params
    const allQuery: Record<string, string> = {};
    if (this._defaultQuery) {
      for (const [k, v] of Object.entries(this._defaultQuery)) {
        if (v !== undefined) allQuery[k] = v;
      }
    }
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) {
          if (Array.isArray(v)) {
            // Canvas uses param[] notation for arrays
            for (const item of v) {
              const sep = url.includes('?') ? '&' : '?';
              url += `${sep}${encodeURIComponent(k)}[]=${encodeURIComponent(String(item))}`;
            }
          } else {
            allQuery[k] = String(v);
          }
        }
      }
    }

    const nonArrayParams = new URLSearchParams(allQuery).toString();
    if (nonArrayParams) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}${nonArrayParams}`;
    }

    // Build headers
    const headers = buildHeaders([
      {
        Accept: 'application/json+canvas-string-ids',
        'User-Agent': `canvas-lms-node/${VERSION}`,
        Authorization: `Bearer ${this.apiKey}`,
      },
      this._defaultHeaders,
      options.headers,
    ]);

    // Build body
    let bodyInit: string | FormData | undefined;
    if (body !== undefined && body !== null) {
      if (body instanceof FormData) {
        bodyInit = body;
      } else if (typeof body === 'object') {
        headers.set('Content-Type', 'application/json');
        bodyInit = JSON.stringify(body);
      } else {
        bodyInit = String(body);
      }
    }

    const init: RequestInit = {
      method: method.toUpperCase(),
      headers,
      ...(bodyInit !== undefined ? { body: bodyInit } : {}),
    };

    return { url, init, timeout };
  }

  private _shouldRetry(response: Response): boolean {
    if (response.status === 408) return true;
    if (response.status === 409) return true;
    if (response.status === 429) return true;
    if (response.status >= 500) return true;
    return false;
  }

  private async _retryRequest(
    options: FinalRequestOptions,
    retriesRemaining: number,
    maxRetries: number,
    responseHeaders?: Headers,
  ): Promise<APIResponseProps> {
    let timeoutMs: number | undefined;

    // Respect Retry-After header
    const retryAfter = responseHeaders?.get('retry-after');
    if (retryAfter) {
      const seconds = parseFloat(retryAfter);
      if (!Number.isNaN(seconds)) {
        timeoutMs = seconds * 1000;
      } else {
        timeoutMs = Date.parse(retryAfter) - Date.now();
      }
    }

    if (timeoutMs === undefined || timeoutMs <= 0) {
      const numRetries = maxRetries - retriesRemaining;
      const initialDelay = 0.5;
      const maxDelay = 8.0;
      const sleepSec = Math.min(initialDelay * Math.pow(2, numRetries), maxDelay);
      const jitter = 1 - Math.random() * 0.25;
      timeoutMs = sleepSec * jitter * 1000;
    }

    await sleep(timeoutMs);
    return this._makeRequest(options, retriesRemaining - 1);
  }
}

export default CanvasLMS;
