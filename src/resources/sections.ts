import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';

// --- Types ---

export interface Section {
  id: number | string;
  name: string;
  sis_section_id?: string | null;
  integration_id?: string | null;
  sis_import_id?: number | string | null;
  course_id: number | string;
  sis_course_id?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  restrict_enrollments_to_section_dates?: boolean | null;
  nonxlist_course_id?: number | string | null;
  total_students?: number;
  created_at?: string;
  [key: string]: unknown;
}

export interface SectionListParams {
  include?: string[];
  per_page?: number;
  [key: string]: unknown;
}

// --- Resource ---

export class Sections extends APIResource {
  /** List sections for a course (paginated). */
  list(courseId: number | string, params?: SectionListParams): PagePromise<Section> {
    return this._client.getAPIList<Section>(`/courses/${courseId}/sections`, { query: params });
  }

  /** Get a single section. */
  get(
    courseId: number | string,
    sectionId: number | string,
    params?: { include?: string[] },
  ): APIPromise<Section> {
    return this._client.get<Section>(`/courses/${courseId}/sections/${sectionId}`, { query: params });
  }

  /** Create a section. */
  create(
    courseId: number | string,
    params: {
      course_section: {
        name: string;
        sis_section_id?: string;
        integration_id?: string;
        start_at?: string;
        end_at?: string;
        restrict_enrollments_to_section_dates?: boolean;
        [key: string]: unknown;
      };
    },
  ): APIPromise<Section> {
    return this._client.post<Section>(`/courses/${courseId}/sections`, { body: params });
  }

  /** Update a section. */
  update(
    sectionId: number | string,
    params: {
      course_section: {
        name?: string;
        sis_section_id?: string;
        integration_id?: string;
        start_at?: string | null;
        end_at?: string | null;
        restrict_enrollments_to_section_dates?: boolean;
        [key: string]: unknown;
      };
    },
  ): APIPromise<Section> {
    return this._client.put<Section>(`/sections/${sectionId}`, { body: params });
  }

  /** Delete a section. */
  delete(sectionId: number | string): APIPromise<Section> {
    return this._client.delete<Section>(`/sections/${sectionId}`);
  }

  /** Cross-list a section into another course. */
  crossList(sectionId: number | string, newCourseId: number | string): APIPromise<Section> {
    return this._client.post<Section>(`/sections/${sectionId}/crosslist/${newCourseId}`);
  }

  /** De-cross-list a section (return to original course). */
  deCrossList(sectionId: number | string): APIPromise<Section> {
    return this._client.delete<Section>(`/sections/${sectionId}/crosslist`);
  }
}
