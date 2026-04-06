import type { APIResponseProps } from '../internal/parse.js';

/**
 * A thenable wrapper around API responses.
 * Uses composition (PromiseLike) instead of `extends Promise` to avoid
 * esbuild class-field transform issues in vitest.
 */
export class APIPromise<T> implements PromiseLike<T> {
  private _promise: Promise<T>;
  private _responsePromise: Promise<APIResponseProps>;

  constructor(
    responsePromise: Promise<APIResponseProps>,
    parseResponse: (props: APIResponseProps) => Promise<T>,
  ) {
    this._responsePromise = responsePromise;
    this._promise = responsePromise.then((props) => parseResponse(props));
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ): Promise<T | TResult> {
    return this._promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T> {
    return this._promise.finally(onfinally);
  }

  /** Get the raw Response object. */
  async asResponse(): Promise<Response> {
    const { response } = await this._responsePromise;
    return response;
  }

  /** Get both the parsed data and the raw Response. */
  async withResponse(): Promise<{ data: T; response: Response }> {
    const [data, { response }] = await Promise.all([
      this._promise,
      this._responsePromise,
    ]);
    return { data, response };
  }
}
