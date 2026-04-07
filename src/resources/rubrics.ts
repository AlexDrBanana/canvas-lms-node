import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';

// --- Types ---

export interface Rubric {
  id: number | string;
  title: string;
  context_id: number | string;
  context_type: string;
  points_possible: number;
  rubric_type?: string;
  reusable?: boolean;
  read_only?: boolean;
  free_form_criterion_comments?: boolean;
  hide_score_total?: boolean;
  data?: RubricCriterion[];
  assessments?: unknown[];
  associations?: unknown[];
  [key: string]: unknown;
}

export interface RubricCriterion {
  id: string;
  description: string;
  long_description?: string;
  points: number;
  criterion_use_range?: boolean;
  ratings: RubricRating[];
  [key: string]: unknown;
}

export interface RubricRating {
  id: string;
  description: string;
  long_description?: string;
  points: number;
  [key: string]: unknown;
}

export interface RubricListParams {
  include?: string[];
  per_page?: number;
  [key: string]: unknown;
}

export interface RubricCreateParams {
  rubric: {
    title: string;
    free_form_criterion_comments?: boolean;
    hide_score_total?: boolean;
    criteria?: Record<string, { description?: string; points?: number; ratings?: Record<string, { description?: string; points?: number; [key: string]: unknown }>; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  rubric_association?: {
    association_id?: number | string;
    association_type?: 'Assignment' | 'Course' | 'Account';
    use_for_grading?: boolean;
    hide_score_total?: boolean;
    purpose?: 'grading' | 'bookmark';
    [key: string]: unknown;
  };
}

export interface RubricUpdateParams {
  rubric?: {
    title?: string;
    free_form_criterion_comments?: boolean;
    hide_score_total?: boolean;
    criteria?: Record<string, { description?: string; points?: number; ratings?: Record<string, { description?: string; points?: number; [key: string]: unknown }>; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  rubric_association?: {
    association_id?: number | string;
    association_type?: 'Assignment' | 'Course' | 'Account';
    use_for_grading?: boolean;
    hide_score_total?: boolean;
    purpose?: 'grading' | 'bookmark';
    [key: string]: unknown;
  };
}

// --- Resource ---

export class Rubrics extends APIResource {
  /** List rubrics for a course (paginated). */
  list(courseId: number | string, params?: RubricListParams): PagePromise<Rubric> {
    return this._client.getAPIList<Rubric>(`/courses/${courseId}/rubrics`, { query: params });
  }

  /** Get a single rubric. */
  get(
    courseId: number | string,
    rubricId: number | string,
    params?: { include?: string[]; style?: string },
  ): APIPromise<Rubric> {
    return this._client.get<Rubric>(`/courses/${courseId}/rubrics/${rubricId}`, { query: params });
  }

  /** Create a rubric for a course. */
  create(courseId: number | string, params: RubricCreateParams): APIPromise<Rubric> {
    return this._client.post<Rubric>(`/courses/${courseId}/rubrics`, { body: params });
  }

  /** Update a rubric. */
  update(
    courseId: number | string,
    rubricId: number | string,
    params: RubricUpdateParams,
  ): APIPromise<Rubric> {
    return this._client.put<Rubric>(`/courses/${courseId}/rubrics/${rubricId}`, { body: params });
  }

  /** Delete a rubric. */
  delete(courseId: number | string, rubricId: number | string): APIPromise<Rubric> {
    return this._client.delete<Rubric>(`/courses/${courseId}/rubrics/${rubricId}`);
  }
}
