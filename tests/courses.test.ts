import { describe, it, expect, beforeAll } from 'vitest';
import { createTestClient } from './helpers.js';
import type { Course } from '../src/resources/courses.js';

const MANUALLY_CREATED_ACCOUNT_ID = 81259;
const TEST_COURSE_ID = 14559815;

describe('Courses resource', () => {
  const client = createTestClient();

  it('list() returns a paginated page of courses', async () => {
    const page = await client.courses.list();
    const items = page.getPaginatedItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);

    const course = items.find((c) => String(c.id) === String(TEST_COURSE_ID));
    expect(course).toBeDefined();
  });

  it('list() supports for-await auto-pagination', async () => {
    const collected: Course[] = [];
    for await (const course of client.courses.list()) {
      collected.push(course);
      if (collected.length >= 5) break;
    }
    expect(collected.length).toBeGreaterThan(0);
    expect(collected[0].id).toBeTruthy();
  });

  it('get() returns a single course', async () => {
    const course = await client.courses.get(TEST_COURSE_ID);
    expect(String(course.id)).toBe(String(TEST_COURSE_ID));
    expect(course.name).toBe('SDK Test Course 2');
    expect(course.workflow_state).toBe('available');
  });

  it('get() with include[] returns extra data', async () => {
    const course = await client.courses.get(TEST_COURSE_ID, {
      include: ['total_students'],
    });
    expect(course.total_students).toBeDefined();
  });

  it('create() + update() + delete() lifecycle', async () => {
    // Create
    const created = await client.courses.create(MANUALLY_CREATED_ACCOUNT_ID, {
      course: { name: 'Lifecycle Test', course_code: 'LC-001' },
      enroll_me: true,
      offer: true,
    });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Lifecycle Test');

    // Update
    const updated = await client.courses.update(created.id, {
      course: { name: 'Lifecycle Test (Updated)' },
    });
    expect(updated.name).toBe('Lifecycle Test (Updated)');

    // Delete
    const result = await client.courses.delete(created.id, { event: 'delete' });
    expect(result).toBeDefined();
  });

  it('listUsers() returns enrolled users', async () => {
    const page = await client.courses.listUsers(TEST_COURSE_ID);
    const users = page.getPaginatedItems();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].id).toBeTruthy();
    expect(users[0].name).toBeTruthy();
  });

  it('getSettings() returns course settings', async () => {
    const settings = await client.courses.getSettings(TEST_COURSE_ID);
    expect(settings).toBeDefined();
    expect(typeof settings).toBe('object');
  });

  it('updateSettings() modifies course settings', async () => {
    const updated = await client.courses.updateSettings(TEST_COURSE_ID, {
      hide_final_grades: false,
    });
    expect(updated).toBeDefined();
  });
});
