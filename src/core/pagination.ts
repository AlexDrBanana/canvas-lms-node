import type { FinalRequestOptions } from '../internal/request-options.js';
import type { CanvasLMS } from '../client.js';
import { APIPromise } from './api-promise.js';
import type { APIResponseProps } from '../internal/parse.js';
import { parseResponse } from '../internal/parse.js';
import { CanvasLMSError } from './error.js';

export type PageRequestOptions = Pick<
  FinalRequestOptions,
  'query' | 'headers' | 'body' | 'path' | 'method'
>;

/**
 * Canvas uses Link-header pagination (RFC 5988).
 * Response body is the array itself; pagination info is in the Link header.
 */
export class LinkPage<Item> implements AsyncIterable<Item> {
  #client: CanvasLMS;
  protected options: FinalRequestOptions;
  protected response: Response;
  protected body: Item[];

  constructor(
    client: CanvasLMS,
    response: Response,
    body: Item[],
    options: FinalRequestOptions,
  ) {
    this.#client = client;
    this.options = options;
    this.response = response;
    this.body = Array.isArray(body) ? body : [];
  }

  getPaginatedItems(): Item[] {
    return this.body;
  }

  /** Parse the Link header for the rel="next" URL */
  private getNextURL(): string | null {
    const linkHeader =
      this.response.headers.get('link') ?? this.response.headers.get('Link');
    if (!linkHeader) return null;

    // Format: <url>; rel="next", <url>; rel="last", ...
    const parts = linkHeader.split(',');
    for (const part of parts) {
      const match = part.match(/<([^>]+)>;\s*rel="next"/i);
      if (match) return match[1]!;
    }
    return null;
  }

  nextPageRequestOptions(): PageRequestOptions | null {
    const nextURL = this.getNextURL();
    if (!nextURL) return null;

    return {
      ...this.options,
      path: nextURL,
      query: undefined, // the full URL from Link header already includes query params
    };
  }

  hasNextPage(): boolean {
    const items = this.getPaginatedItems();
    if (!items.length) return false;
    return this.nextPageRequestOptions() != null;
  }

  async getNextPage(): Promise<LinkPage<Item>> {
    const nextOptions = this.nextPageRequestOptions();
    if (!nextOptions) {
      throw new CanvasLMSError(
        'No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.',
      );
    }
    return await this.#client._requestAPIList<Item>(
      nextOptions as FinalRequestOptions,
    );
  }

  async *iterPages(): AsyncGenerator<LinkPage<Item>> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let page: LinkPage<Item> = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<Item> {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
}

/**
 * Resolves to a LinkPage once the request completes.
 * Also implements AsyncIterable for `for await...of` auto-pagination.
 */
export class PagePromise<Item>
  implements PromiseLike<LinkPage<Item>>, AsyncIterable<Item>
{
  private _inner: APIPromise<LinkPage<Item>>;

  constructor(
    client: CanvasLMS,
    request: Promise<APIResponseProps>,
  ) {
    this._inner = new APIPromise<LinkPage<Item>>(request, async (props) => {
      const body = (await parseResponse<Item[]>(props.response)) as Item[];
      return new LinkPage<Item>(client, props.response, body, props.options);
    });
  }

  then<TResult1 = LinkPage<Item>, TResult2 = never>(
    onfulfilled?: ((value: LinkPage<Item>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this._inner.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ): Promise<LinkPage<Item> | TResult> {
    return this._inner.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<LinkPage<Item>> {
    return this._inner.finally(onfinally);
  }

  async asResponse(): Promise<Response> {
    return this._inner.asResponse();
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<Item> {
    const page: LinkPage<Item> = await this._inner;
    for await (const item of page) {
      yield item;
    }
  }
}
