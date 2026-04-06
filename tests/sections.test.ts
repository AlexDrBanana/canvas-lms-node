import { describe, it, expect } from 'vitest';
import { createTestClient } from './helpers.js';

const TEST_COURSE_ID = 14559815;
const TEST_SECTION_ID = 13798114;

describe('Sections resource', () => {
  const client = createTestClient();

  it('list() returns sections for a course', async () => {
    const page = await client.sections.list(TEST_COURSE_ID);
    const items = page.getPaginatedItems();
    // At least the default section + our created section
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('get() returns a single section', async () => {
    const section = await client.sections.get(TEST_COURSE_ID, TEST_SECTION_ID);
    expect(String(section.id)).toBe(String(TEST_SECTION_ID));
    expect(section.name).toBe('Test Section A');
  });

  it('create() creates a new section', async () => {
    const section = await client.sections.create(TEST_COURSE_ID, {
      course_section: { name: 'Temp Section' },
    });
    expect(section.id).toBeTruthy();
    expect(section.name).toBe('Temp Section');
    expect(String(section.course_id)).toBe(String(TEST_COURSE_ID));
  });
});
