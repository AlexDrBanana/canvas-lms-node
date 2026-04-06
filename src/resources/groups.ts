import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';
import type { User } from './users.js';

// --- Types ---

export interface Group {
  id: number | string;
  name: string;
  description?: string | null;
  is_public?: boolean;
  followed_by_user?: boolean;
  join_level?: string;
  members_count: number;
  avatar_url?: string | null;
  context_type?: string;
  course_id?: number | string | null;
  role?: string | null;
  group_category_id: number | string;
  sis_group_id?: string | null;
  sis_import_id?: number | string | null;
  storage_quota_mb?: number;
  created_at?: string;
  [key: string]: unknown;
}

export interface GroupCategory {
  id: number | string;
  name: string;
  role?: string | null;
  self_signup?: string | null;
  auto_leader?: string | null;
  context_type: string;
  account_id?: number | string | null;
  course_id?: number | string | null;
  group_limit?: number | null;
  sis_group_category_id?: string | null;
  sis_import_id?: number | string | null;
  created_at?: string;
  [key: string]: unknown;
}

// --- Resource ---

export class Groups extends APIResource {
  /** List groups for the current user (paginated). */
  list(params?: { context_type?: string; include?: string[]; per_page?: number; [key: string]: unknown }): PagePromise<Group> {
    return this._client.getAPIList<Group>('/users/self/groups', { query: params });
  }

  /** Get a single group. */
  get(groupId: number | string, params?: { include?: string[] }): APIPromise<Group> {
    return this._client.get<Group>(`/groups/${groupId}`, { query: params });
  }

  /** List users in a group (paginated). */
  listUsers(groupId: number | string, params?: { search_term?: string; include?: string[]; per_page?: number }): PagePromise<User> {
    return this._client.getAPIList<User>(`/groups/${groupId}/users`, { query: params });
  }

  /** List group categories for a course (paginated). */
  listGroupCategories(courseId: number | string): PagePromise<GroupCategory> {
    return this._client.getAPIList<GroupCategory>(`/courses/${courseId}/group_categories`);
  }

  /** List groups in a group category (paginated). */
  listGroupsInCategory(groupCategoryId: number | string): PagePromise<Group> {
    return this._client.getAPIList<Group>(`/group_categories/${groupCategoryId}/groups`);
  }
}
