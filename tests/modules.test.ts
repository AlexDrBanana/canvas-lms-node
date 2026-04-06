import { describe, it, expect } from 'vitest';
import { createTestClient } from './helpers.js';

const TEST_COURSE_ID = 14559815;
const TEST_MODULE_ID = 22935563;

describe('Modules resource', () => {
  const client = createTestClient();

  it('list() returns modules for a course', async () => {
    const page = await client.modules.list(TEST_COURSE_ID);
    const items = page.getPaginatedItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].name).toBeTruthy();
  });

  it('get() returns a single module', async () => {
    const mod = await client.modules.get(TEST_COURSE_ID, TEST_MODULE_ID);
    expect(String(mod.id)).toBe(String(TEST_MODULE_ID));
    expect(mod.name).toBe('Week 1 Module');
  });

  it('listItems() returns items in a module', async () => {
    const page = await client.modules.listItems(TEST_COURSE_ID, TEST_MODULE_ID);
    const items = page.getPaginatedItems();
    // Module may be empty; just confirm it works
    expect(Array.isArray(items)).toBe(true);
  });
});
