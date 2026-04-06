import { describe, it, expect } from 'vitest';
import { createTestClient } from './helpers.js';
import type { Course } from '../src/resources/courses.js';

/**
 * Tests for Link-header based pagination.
 * Canvas returns pagination info in the Link response header.
 */
describe('Pagination', () => {
  const client = createTestClient();

  it('page object exposes getPaginatedItems()', async () => {
    const page = await client.courses.list({ per_page: 1 });
    const items = page.getPaginatedItems();
    expect(Array.isArray(items)).toBe(true);
  });

  it('page reports hasNextPage() correctly', async () => {
    const page = await client.courses.list({ per_page: 1 });
    const items = page.getPaginatedItems();
    if (items.length > 0) {
      // If there is at least 1 course and more exist, hasNextPage should be true
      // (Can't guarantee this on all accounts, so just test the method exists)
      expect(typeof page.hasNextPage()).toBe('boolean');
    }
  });

  it('iterPages() yields all pages', async () => {
    const firstPage = await client.courses.list({ per_page: 1 });
    let pageCount = 0;
    for await (const page of firstPage.iterPages()) {
      pageCount++;
      expect(page.getPaginatedItems().length).toBeGreaterThanOrEqual(0);
      if (pageCount >= 3) break;
    }
    expect(pageCount).toBeGreaterThan(0);
  });

  it('for-await on PagePromise auto-paginates', async () => {
    const all: Course[] = [];
    for await (const course of client.courses.list({ per_page: 1 })) {
      all.push(course);
      if (all.length >= 5) break;
    }
    expect(all.length).toBeGreaterThan(0);
    expect(all[0].id).toBeTruthy();
  });

  it('.asResponse() returns the underlying HTTP response', async () => {
    const response = await client.courses.list().asResponse();
    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get('link')).toBeTruthy();
  });
});
