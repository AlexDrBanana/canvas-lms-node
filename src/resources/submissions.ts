import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';

// --- Types ---

export interface Submission {
  id: number | string;
  assignment_id: number | string;
  user_id: number | string;
  body?: string | null;
  url?: string | null;
  grade?: string | null;
  score?: number | null;
  submitted_at?: string | null;
  graded_at?: string | null;
  grader_id?: number | string | null;
  attempt?: number | null;
  submission_type?: string | null;
  workflow_state: string;
  grade_matches_current_submission?: boolean;
  preview_url?: string;
  late?: boolean;
  missing?: boolean;
  excused?: boolean | null;
  late_policy_status?: string | null;
  points_deducted?: number | null;
  seconds_late?: number;
  entered_grade?: string | null;
  entered_score?: number | null;
  attachments?: SubmissionAttachment[];
  rubric_assessment?: Record<string, RubricAssessmentEntry>;
  full_rubric_assessment?: Record<string, RubricAssessmentEntry>;
  submission_comments?: SubmissionComment[];
  [key: string]: unknown;
}

export interface SubmissionAttachment {
  id: number | string;
  uuid?: string;
  folder_id?: number | string;
  display_name: string;
  filename: string;
  'content-type'?: string;
  content_type?: string;
  url: string;
  size: number;
  created_at?: string;
  updated_at?: string;
  mime_class?: string;
  [key: string]: unknown;
}

export interface RubricAssessmentEntry {
  points?: number;
  rating_id?: string;
  comments?: string;
  [key: string]: unknown;
}

export interface SubmissionComment {
  id: number | string;
  author_id: number | string;
  author_name: string;
  comment: string;
  created_at: string;
  edited_at?: string | null;
  [key: string]: unknown;
}

export interface SubmissionListParams {
  include?: string[];
  grouped?: boolean;
  student_ids?: (number | string)[];
  assignment_ids?: (number | string)[];
  post_to_sis?: boolean;
  submitted_since?: string;
  graded_since?: string;
  grading_period_id?: number | string;
  workflow_state?: 'submitted' | 'unsubmitted' | 'graded' | 'pending_review';
  enrollment_state?: 'active' | 'concluded';
  state_based_on_date?: boolean;
  order?: 'id' | 'graded_at';
  order_direction?: 'ascending' | 'descending';
  per_page?: number;
  [key: string]: unknown;
}

export interface SubmissionUpdateParams {
  submission?: {
    posted_grade?: string | number;
    excuse?: boolean;
    late_policy_status?: string;
    seconds_late_override?: number;
    [key: string]: unknown;
  };
  comment?: {
    text_comment?: string;
    group_comment?: boolean;
    [key: string]: unknown;
  };
  rubric_assessment?: Record<string, RubricAssessmentEntry>;
  [key: string]: unknown;
}

// --- Resource ---

export class Submissions extends APIResource {
  /** List submissions for an assignment (paginated). */
  list(
    courseId: number | string,
    assignmentId: number | string,
    params?: SubmissionListParams,
  ): PagePromise<Submission> {
    return this._client.getAPIList<Submission>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions`,
      { query: params },
    );
  }

  /** Get a single submission. */
  get(
    courseId: number | string,
    assignmentId: number | string,
    userId: number | string,
    params?: { include?: string[] },
  ): APIPromise<Submission> {
    return this._client.get<Submission>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`,
      { query: params },
    );
  }

  /** Update a submission (grade, rubric_assessment, comments). */
  update(
    courseId: number | string,
    assignmentId: number | string,
    userId: number | string,
    params: SubmissionUpdateParams,
  ): APIPromise<Submission> {
    return this._client.put<Submission>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`,
      { body: params },
    );
  }

  /** List submissions for multiple assignments in a course (paginated). */
  listForMultipleAssignments(
    courseId: number | string,
    params?: SubmissionListParams,
  ): PagePromise<Submission> {
    return this._client.getAPIList<Submission>(
      `/courses/${courseId}/students/submissions`,
      { query: params },
    );
  }
}
