import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';

// --- Types ---

export interface Course {
  id: number | string;
  name: string;
  course_code: string;
  uuid?: string;
  sis_course_id?: string | null;
  integration_id?: string | null;
  workflow_state: 'unpublished' | 'available' | 'completed' | 'deleted';
  account_id: number | string;
  root_account_id: number | string;
  enrollment_term_id: number | string;
  grading_standard_id?: number | string | null;
  created_at: string;
  start_at: string | null;
  end_at: string | null;
  locale?: string | null;
  total_students?: number;
  default_view?: string;
  syllabus_body?: string;
  needs_grading_count?: number;
  apply_assignment_group_weights: boolean;
  is_public?: boolean;
  public_syllabus?: boolean;
  storage_quota_mb?: number;
  hide_final_grades?: boolean;
  time_zone?: string;
  blueprint?: boolean;
  enrollments?: unknown[];
  term?: unknown;
  course_progress?: unknown;
  permissions?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface CourseListParams {
  enrollment_type?: string;
  enrollment_role?: string;
  enrollment_role_id?: number;
  enrollment_state?: 'active' | 'invited_or_pending' | 'completed';
  exclude_blueprint_courses?: boolean;
  include?: string[];
  state?: string[];
  per_page?: number;
  [key: string]: unknown;
}

export interface CourseCreateParams {
  course: {
    name: string;
    course_code?: string;
    start_at?: string;
    end_at?: string;
    license?: string;
    is_public?: boolean;
    is_public_to_auth_users?: boolean;
    public_syllabus?: boolean;
    public_description?: string;
    allow_student_wiki_edits?: boolean;
    allow_wiki_comments?: boolean;
    allow_student_forum_attachments?: boolean;
    open_enrollment?: boolean;
    self_enrollment?: boolean;
    restrict_enrollments_to_course_dates?: boolean;
    term_id?: number | string;
    sis_course_id?: string;
    integration_id?: string;
    hide_final_grades?: boolean;
    apply_assignment_group_weights?: boolean;
    time_zone?: string;
    default_view?: string;
    syllabus_body?: string;
    grading_standard_id?: number | string;
    course_format?: string;
    [key: string]: unknown;
  };
  offer?: boolean;
  enroll_me?: boolean;
  enable_sis_reactivation?: boolean;
}

export interface CourseUpdateParams {
  course?: Partial<CourseCreateParams['course']>;
  offer?: boolean;
  [key: string]: unknown;
}

// --- Resource ---

export class Courses extends APIResource {
  /** List your courses (paginated). */
  list(params?: CourseListParams): PagePromise<Course> {
    return this._client.getAPIList<Course>('/courses', { query: params });
  }

  /** List courses for a specific user (paginated). */
  listForUser(userId: number | string, params?: CourseListParams): PagePromise<Course> {
    return this._client.getAPIList<Course>(`/users/${userId}/courses`, { query: params });
  }

  /** Get a single course by ID. */
  get(courseId: number | string, params?: { include?: string[] }): import('../core/api-promise.js').APIPromise<Course> {
    return this._client.get<Course>(`/courses/${courseId}`, { query: params });
  }

  /** Create a new course in an account. */
  create(accountId: number | string, params: CourseCreateParams): import('../core/api-promise.js').APIPromise<Course> {
    return this._client.post<Course>(`/accounts/${accountId}/courses`, { body: params });
  }

  /** Update an existing course. */
  update(courseId: number | string, params: CourseUpdateParams): import('../core/api-promise.js').APIPromise<Course> {
    return this._client.put<Course>(`/courses/${courseId}`, { body: params });
  }

  /** Delete or conclude a course. */
  delete(courseId: number | string, params?: { event?: 'delete' | 'conclude' }): import('../core/api-promise.js').APIPromise<{ delete: boolean }> {
    return this._client.delete(`/courses/${courseId}`, { query: params ?? { event: 'delete' } });
  }

  /** List users in a course (paginated). */
  listUsers(
    courseId: number | string,
    params?: { enrollment_type?: string[]; include?: string[]; search_term?: string; per_page?: number; [key: string]: unknown },
  ): PagePromise<import('./users.js').User> {
    return this._client.getAPIList<import('./users.js').User>(`/courses/${courseId}/users`, { query: params });
  }

  /** Get a single user in a course. */
  getUser(
    courseId: number | string,
    userId: number | string,
    params?: { include?: string[] },
  ): import('../core/api-promise.js').APIPromise<import('./users.js').User> {
    return this._client.get(`/courses/${courseId}/users/${userId}`, { query: params });
  }

  /** Get course settings. */
  getSettings(courseId: number | string): import('../core/api-promise.js').APIPromise<Record<string, unknown>> {
    return this._client.get(`/courses/${courseId}/settings`);
  }

  /** Update course settings. */
  updateSettings(courseId: number | string, params: Record<string, unknown>): import('../core/api-promise.js').APIPromise<Record<string, unknown>> {
    return this._client.put(`/courses/${courseId}/settings`, { body: params });
  }
}
