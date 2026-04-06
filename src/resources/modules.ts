import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';

// --- Types ---

export interface Module {
  id: number | string;
  name: string;
  position: number;
  unlock_at?: string | null;
  require_sequential_progress?: boolean;
  prerequisite_module_ids?: (number | string)[];
  items_count: number;
  items_url: string;
  items?: ModuleItem[];
  state?: string;
  completed_at?: string | null;
  publish_final_grade?: boolean;
  published?: boolean;
  [key: string]: unknown;
}

export interface ModuleItem {
  id: number | string;
  module_id: number | string;
  position: number;
  title: string;
  indent: number;
  type: string;
  content_id?: number | string;
  html_url?: string;
  url?: string;
  page_url?: string;
  external_url?: string;
  new_tab?: boolean;
  completion_requirement?: {
    type: string;
    min_score?: number;
    completed?: boolean;
    [key: string]: unknown;
  };
  published?: boolean;
  [key: string]: unknown;
}

export interface ModuleListParams {
  include?: string[];
  search_term?: string;
  student_id?: number | string;
  per_page?: number;
  [key: string]: unknown;
}

// --- Resource ---

export class Modules extends APIResource {
  /** List modules for a course (paginated). */
  list(courseId: number | string, params?: ModuleListParams): PagePromise<Module> {
    return this._client.getAPIList<Module>(`/courses/${courseId}/modules`, { query: params });
  }

  /** Get a single module. */
  get(
    courseId: number | string,
    moduleId: number | string,
    params?: { include?: string[] },
  ): APIPromise<Module> {
    return this._client.get<Module>(`/courses/${courseId}/modules/${moduleId}`, { query: params });
  }

  /** List items in a module (paginated). */
  listItems(
    courseId: number | string,
    moduleId: number | string,
    params?: { include?: string[]; per_page?: number },
  ): PagePromise<ModuleItem> {
    return this._client.getAPIList<ModuleItem>(`/courses/${courseId}/modules/${moduleId}/items`, { query: params });
  }
}
