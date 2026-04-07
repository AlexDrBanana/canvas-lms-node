import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';

// --- Types ---

export interface Assignment {
  id: number | string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  due_at?: string | null;
  lock_at?: string | null;
  unlock_at?: string | null;
  course_id: number | string;
  html_url: string;
  submissions_download_url?: string;
  assignment_group_id: number | string;
  points_possible: number | null;
  grading_type: string;
  submission_types: string[];
  position: number;
  published: boolean;
  workflow_state: string;
  rubric?: RubricCriterion[];
  rubric_settings?: Record<string, unknown>;
  group_category_id?: number | string | null;
  needs_grading_count?: number;
  has_submitted_submissions?: boolean;
  peer_reviews?: boolean;
  automatic_peer_reviews?: boolean;
  allowed_extensions?: string[];
  max_name_length?: number;
  turnitin_enabled?: boolean;
  vericite_enabled?: boolean;
  muted?: boolean;
  omit_from_final_grade?: boolean;
  [key: string]: unknown;
}

export interface RubricCriterion {
  id: string;
  description: string;
  long_description?: string;
  points: number;
  criterion_use_range?: boolean;
  ratings: RubricRating[];
}

export interface RubricRating {
  id: string;
  description: string;
  long_description?: string;
  points: number;
}

export interface AssignmentListParams {
  include?: string[];
  search_term?: string;
  override_assignment_dates?: boolean;
  needs_grading_count_by_section?: boolean;
  bucket?: string;
  assignment_ids?: string[];
  order_by?: 'position' | 'name' | 'due_at';
  per_page?: number;
  [key: string]: unknown;
}

export interface AssignmentCreateParams {
  assignment: {
    name: string;
    position?: number;
    submission_types?: string[];
    allowed_extensions?: string[];
    turnitin_enabled?: boolean;
    vericite_enabled?: boolean;
    turnitin_settings?: Record<string, unknown>;
    peer_reviews?: boolean;
    automatic_peer_reviews?: boolean;
    notify_of_update?: boolean;
    group_category_id?: number | string;
    grade_group_students_individually?: boolean;
    points_possible?: number;
    grading_type?: string;
    due_at?: string;
    lock_at?: string;
    unlock_at?: string;
    description?: string;
    assignment_group_id?: number | string;
    muted?: boolean;
    assignment_overrides?: unknown[];
    only_visible_to_overrides?: boolean;
    published?: boolean;
    grading_standard_id?: number | string;
    omit_from_final_grade?: boolean;
    [key: string]: unknown;
  };
}

export interface AssignmentUpdateParams {
  assignment: Partial<AssignmentCreateParams['assignment']>;
}

export interface AssignmentOverride {
  id: number | string;
  assignment_id?: number | string;
  student_ids?: (number | string)[];
  group_id?: number | string;
  course_section_id?: number | string;
  title: string;
  due_at?: string | null;
  all_day?: boolean;
  all_day_date?: string | null;
  unlock_at?: string | null;
  lock_at?: string | null;
  [key: string]: unknown;
}

export interface AssignmentOverrideCreateParams {
  assignment_override: {
    student_ids?: (number | string)[];
    title?: string;
    group_id?: number | string;
    course_section_id?: number | string;
    due_at?: string | null;
    unlock_at?: string | null;
    lock_at?: string | null;
    [key: string]: unknown;
  };
}

export interface AssignmentOverrideUpdateParams {
  assignment_override: {
    student_ids?: (number | string)[];
    title?: string;
    due_at?: string | null;
    unlock_at?: string | null;
    lock_at?: string | null;
    [key: string]: unknown;
  };
}

// --- Resource ---

export class Assignments extends APIResource {
  /** List assignments for a course (paginated). */
  list(courseId: number | string, params?: AssignmentListParams): PagePromise<Assignment> {
    return this._client.getAPIList<Assignment>(`/courses/${courseId}/assignments`, { query: params });
  }

  /** Get a single assignment. */
  get(
    courseId: number | string,
    assignmentId: number | string,
    params?: { include?: string[] },
  ): APIPromise<Assignment> {
    return this._client.get<Assignment>(`/courses/${courseId}/assignments/${assignmentId}`, { query: params });
  }

  /** Create an assignment. */
  create(courseId: number | string, params: AssignmentCreateParams): APIPromise<Assignment> {
    return this._client.post<Assignment>(`/courses/${courseId}/assignments`, { body: params });
  }

  /** Update an assignment. */
  update(
    courseId: number | string,
    assignmentId: number | string,
    params: AssignmentUpdateParams,
  ): APIPromise<Assignment> {
    return this._client.put<Assignment>(`/courses/${courseId}/assignments/${assignmentId}`, { body: params });
  }

  /** Delete an assignment. */
  delete(courseId: number | string, assignmentId: number | string): APIPromise<Assignment> {
    return this._client.delete<Assignment>(`/courses/${courseId}/assignments/${assignmentId}`);
  }

  /** List assignment overrides (paginated). */
  listOverrides(
    courseId: number | string,
    assignmentId: number | string,
    params?: { per_page?: number; [key: string]: unknown },
  ): PagePromise<AssignmentOverride> {
    return this._client.getAPIList<AssignmentOverride>(
      `/courses/${courseId}/assignments/${assignmentId}/overrides`,
      { query: params },
    );
  }

  /** Get a single assignment override. */
  getOverride(
    courseId: number | string,
    assignmentId: number | string,
    overrideId: number | string,
  ): APIPromise<AssignmentOverride> {
    return this._client.get<AssignmentOverride>(
      `/courses/${courseId}/assignments/${assignmentId}/overrides/${overrideId}`,
    );
  }

  /** Create an assignment override. */
  createOverride(
    courseId: number | string,
    assignmentId: number | string,
    params: AssignmentOverrideCreateParams,
  ): APIPromise<AssignmentOverride> {
    return this._client.post<AssignmentOverride>(
      `/courses/${courseId}/assignments/${assignmentId}/overrides`,
      { body: params },
    );
  }

  /** Update an assignment override. */
  updateOverride(
    courseId: number | string,
    assignmentId: number | string,
    overrideId: number | string,
    params: AssignmentOverrideUpdateParams,
  ): APIPromise<AssignmentOverride> {
    return this._client.put<AssignmentOverride>(
      `/courses/${courseId}/assignments/${assignmentId}/overrides/${overrideId}`,
      { body: params },
    );
  }

  /** Delete an assignment override. */
  deleteOverride(
    courseId: number | string,
    assignmentId: number | string,
    overrideId: number | string,
  ): APIPromise<AssignmentOverride> {
    return this._client.delete<AssignmentOverride>(
      `/courses/${courseId}/assignments/${assignmentId}/overrides/${overrideId}`,
    );
  }
}
