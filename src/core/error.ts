export class CanvasLMSError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CanvasLMSError';
  }
}

export class APIError extends CanvasLMSError {
  readonly status: number;
  readonly headers: Headers;
  readonly error: unknown;

  constructor(
    status: number,
    error: unknown,
    message: string | undefined,
    headers: Headers,
  ) {
    const msg =
      message ??
      (typeof error === 'object' && error !== null && 'message' in error
        ? String((error as Record<string, unknown>).message)
        : `API error ${status}`);
    super(msg);
    this.name = 'APIError';
    this.status = status;
    this.headers = headers;
    this.error = error;
  }

  static generate(
    status: number,
    error: unknown,
    message: string | undefined,
    headers: Headers,
  ): APIError {
    if (status === 400) return new BadRequestError(status, error, message, headers);
    if (status === 401) return new AuthenticationError(status, error, message, headers);
    if (status === 403) return new PermissionDeniedError(status, error, message, headers);
    if (status === 404) return new NotFoundError(status, error, message, headers);
    if (status === 409) return new ConflictError(status, error, message, headers);
    if (status === 422) return new UnprocessableEntityError(status, error, message, headers);
    if (status === 429) return new RateLimitError(status, error, message, headers);
    if (status >= 500) return new InternalServerError(status, error, message, headers);
    return new APIError(status, error, message, headers);
  }
}

export class BadRequestError extends APIError {
  override readonly name = 'BadRequestError';
}

export class AuthenticationError extends APIError {
  override readonly name = 'AuthenticationError';
}

export class PermissionDeniedError extends APIError {
  override readonly name = 'PermissionDeniedError';
}

export class NotFoundError extends APIError {
  override readonly name = 'NotFoundError';
}

export class ConflictError extends APIError {
  override readonly name = 'ConflictError';
}

export class UnprocessableEntityError extends APIError {
  override readonly name = 'UnprocessableEntityError';
}

export class RateLimitError extends APIError {
  override readonly name = 'RateLimitError';
}

export class InternalServerError extends APIError {
  override readonly name = 'InternalServerError';
}

export class APIConnectionError extends CanvasLMSError {
  constructor(options?: { cause?: Error }) {
    super('Connection error.', options);
    this.name = 'APIConnectionError';
  }
}

export class APIConnectionTimeoutError extends APIConnectionError {
  constructor() {
    super();
    this.message = 'Request timed out.';
    this.name = 'APIConnectionTimeoutError';
  }
}

export class APIUserAbortError extends CanvasLMSError {
  constructor() {
    super('Request was aborted.');
    this.name = 'APIUserAbortError';
  }
}
