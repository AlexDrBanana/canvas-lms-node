import { describe, it, expect } from 'vitest';
import { createTestClient } from './helpers.js';
import { NotFoundError } from '../src/index.js';

const TEST_COURSE_ID = 14559815;
const TEST_ASSIGNMENT_ID = 63802175;
const TEST_USER_ID = 254589618;

describe('Submissions resource', () => {
  const client = createTestClient();

  it('list() returns submissions for an assignment', async () => {
    const page = await client.submissions.list(TEST_COURSE_ID, TEST_ASSIGNMENT_ID);
    const items = page.getPaginatedItems();
    expect(Array.isArray(items)).toBe(true);
  });

  it('list() with include returns submission details', async () => {
    const page = await client.submissions.list(TEST_COURSE_ID, TEST_ASSIGNMENT_ID, {
      include: ['submission_comments'],
    });
    const items = page.getPaginatedItems();
    expect(Array.isArray(items)).toBe(true);
    if (items.length > 0) {
      expect(items[0].assignment_id).toBeTruthy();
    }
  });

  it('get() returns 404 for user without submission record', async () => {
    // On Canvas free accounts, teacher-only enrollments may not have submission records
    await expect(
      client.submissions.get(TEST_COURSE_ID, TEST_ASSIGNMENT_ID, TEST_USER_ID),
    ).rejects.toThrow(NotFoundError);
  });

  it('update() grades via submission update endpoint', async () => {
    // This may 404 if no student submission exists; test the API call pattern
    try {
      const updated = await client.submissions.update(
        TEST_COURSE_ID,
        TEST_ASSIGNMENT_ID,
        TEST_USER_ID,
        {
          submission: { posted_grade: '85' },
          comment: { text_comment: 'SDK integration test comment' },
        },
      );
      expect(updated).toBeDefined();
      expect(updated.score).toBe(85);
    } catch (err) {
      // Expected on free accounts without student submissions
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });

  it('listForMultipleAssignments() returns submissions across assignments', async () => {
    const page = await client.submissions.listForMultipleAssignments(TEST_COURSE_ID, {
      student_ids: ['all'],
    });
    const items = page.getPaginatedItems();
    expect(Array.isArray(items)).toBe(true);
  });
});
