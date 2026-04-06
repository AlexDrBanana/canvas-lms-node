import { describe, it, expect, beforeAll } from 'vitest';
import { createTestClient } from './helpers.js';
import type { Assignment } from '../src/resources/assignments.js';

const TEST_COURSE_ID = 14559815;
const TEST_ASSIGNMENT_ID = 63802175;

describe('Assignments resource', () => {
  const client = createTestClient();

  it('list() returns assignments for a course', async () => {
    const page = await client.assignments.list(TEST_COURSE_ID);
    const items = page.getPaginatedItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].name).toBeTruthy();
    expect(items[0].course_id).toBeTruthy();
  });

  it('list() supports for-await auto-pagination', async () => {
    const collected: Assignment[] = [];
    for await (const a of client.assignments.list(TEST_COURSE_ID)) {
      collected.push(a);
    }
    expect(collected.length).toBeGreaterThan(0);
  });

  it('get() returns a single assignment', async () => {
    const assignment = await client.assignments.get(TEST_COURSE_ID, TEST_ASSIGNMENT_ID);
    expect(String(assignment.id)).toBe(String(TEST_ASSIGNMENT_ID));
    expect(assignment.name).toBe('SDK Test Assignment');
    expect(assignment.points_possible).toBe(100);
  });

  it('create() + update() + delete() lifecycle', async () => {
    // Create
    const created = await client.assignments.create(TEST_COURSE_ID, {
      assignment: {
        name: 'Temp Assignment',
        points_possible: 50,
        submission_types: ['online_text_entry'],
        published: true,
      },
    });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Temp Assignment');
    expect(created.points_possible).toBe(50);

    // Update
    const updated = await client.assignments.update(TEST_COURSE_ID, created.id, {
      assignment: { name: 'Temp Assignment (Renamed)' },
    });
    expect(updated.name).toBe('Temp Assignment (Renamed)');

    // Delete
    const deleted = await client.assignments.delete(TEST_COURSE_ID, created.id);
    expect(deleted).toBeDefined();
  });
});
