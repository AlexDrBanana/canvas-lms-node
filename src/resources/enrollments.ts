import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';

// --- Types ---

export interface Enrollment {
  id: number | string;
  course_id: number | string;
  sis_course_id?: string | null;
  course_integration_id?: string | null;
  course_section_id: number | string;
  section_integration_id?: string | null;
  sis_account_id?: string | null;
  sis_section_id?: string | null;
  sis_user_id?: string | null;
  enrollment_state: string;
  type: string;
  user_id: number | string;
  role: string;
  role_id: number | string;
  created_at: string;
  updated_at: string;
  start_at?: string | null;
  end_at?: string | null;
  last_activity_at?: string | null;
  last_attended_at?: string | null;
  total_activity_time?: number;
  html_url: string;
  grades?: {
    html_url?: string;
    current_grade?: string | null;
    final_grade?: string | null;
    current_score?: number | null;
    final_score?: number | null;
    unposted_current_grade?: string | null;
    unposted_final_grade?: string | null;
    unposted_current_score?: number | null;
    unposted_final_score?: number | null;
    [key: string]: unknown;
  };
  user?: import('./users.js').User;
  [key: string]: unknown;
}

export interface EnrollmentListParams {
  type?: string[];
  role?: string[];
  state?: string[];
  include?: string[];
  user_id?: number | string;
  grading_period_id?: number | string;
  enrollment_term_id?: number | string;
  sis_account_id?: string[];
  sis_course_id?: string[];
  sis_section_id?: string[];
  sis_user_id?: string[];
  per_page?: number;
  [key: string]: unknown;
}

export interface EnrollmentCreateParams {
  enrollment: {
    user_id: number | string;
    type: string;
    role_id?: number | string;
    enrollment_state?: 'active' | 'invited' | 'inactive';
    course_section_id?: number | string;
    limit_privileges_to_course_section?: boolean;
    notify?: boolean;
    self_enrollment_code?: string;
    self_enrolled?: boolean;
    [key: string]: unknown;
  };
}

// --- Resource ---

export class Enrollments extends APIResource {
  /** List enrollments for a course (paginated). */
  list(courseId: number | string, params?: EnrollmentListParams): PagePromise<Enrollment> {
    return this._client.getAPIList<Enrollment>(`/courses/${courseId}/enrollments`, { query: params });
  }

  /** List enrollments for a user (paginated). */
  listForUser(userId: number | string, params?: EnrollmentListParams): PagePromise<Enrollment> {
    return this._client.getAPIList<Enrollment>(`/users/${userId}/enrollments`, { query: params });
  }

  /** Enroll a user in a course. */
  create(courseId: number | string, params: EnrollmentCreateParams): APIPromise<Enrollment> {
    return this._client.post<Enrollment>(`/courses/${courseId}/enrollments`, { body: params });
  }

  /** Conclude, delete, or deactivate an enrollment. */
  delete(
    courseId: number | string,
    enrollmentId: number | string,
    params?: { task?: 'conclude' | 'delete' | 'inactivate' | 'deactivate' },
  ): APIPromise<Enrollment> {
    return this._client.delete<Enrollment>(`/courses/${courseId}/enrollments/${enrollmentId}`, {
      query: params ?? { task: 'conclude' },
    });
  }
}
