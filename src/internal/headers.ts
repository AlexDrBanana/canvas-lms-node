export type HeadersLike = Record<string, string | null | undefined> | undefined;

export function buildHeaders(
  sources: (HeadersLike | Headers)[],
): Headers {
  const headers = new Headers();
  for (const source of sources) {
    if (!source) continue;
    if (source instanceof Headers) {
      source.forEach((value, key) => {
        headers.set(key, value);
      });
    } else {
      for (const [key, value] of Object.entries(source)) {
        if (value === null) {
          headers.delete(key);
        } else if (value !== undefined) {
          headers.set(key, value);
        }
      }
    }
  }
  return headers;
}
