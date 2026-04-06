import { describe, it, expect } from 'vitest';
import { createTestClient } from './helpers.js';

const TEST_COURSE_ID = 14559815;

describe('Enrollments resource', () => {
  const client = createTestClient();

  it('list() returns enrollments for a course', async () => {
    const page = await client.enrollments.list(TEST_COURSE_ID);
    const items = page.getPaginatedItems();
    expect(items.length).toBeGreaterThan(0);

    const teacherEnrollment = items.find((e) => e.type === 'TeacherEnrollment');
    expect(teacherEnrollment).toBeDefined();
    expect(teacherEnrollment!.enrollment_state).toBe('active');
  });

  it('list() supports for-await iteration', async () => {
    const enrollments = [];
    for await (const e of client.enrollments.list(TEST_COURSE_ID)) {
      enrollments.push(e);
    }
    expect(enrollments.length).toBeGreaterThan(0);
  });

  it('listForUser() returns enrollments for the current user', async () => {
    const page = await client.enrollments.listForUser('self');
    const items = page.getPaginatedItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].user_id).toBeTruthy();
  });
});
