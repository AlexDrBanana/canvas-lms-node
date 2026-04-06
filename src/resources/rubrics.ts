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
}
