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

export interface GroupMembership {
  id: number | string;
  group_id: number | string;
  user_id: number | string;
  workflow_state: string;
  moderator?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface GroupCreateParams {
  name: string;
  description?: string;
  is_public?: boolean;
  join_level?: 'parent_context_auto_join' | 'parent_context_request' | 'invitation_only';
  storage_quota_mb?: number;
  [key: string]: unknown;
}

export interface GroupUpdateParams {
  name?: string;
  description?: string;
  is_public?: boolean;
  join_level?: 'parent_context_auto_join' | 'parent_context_request' | 'invitation_only';
  avatar_id?: number | string;
  storage_quota_mb?: number;
  members?: (number | string)[];
  [key: string]: unknown;
}

export interface GroupCategoryCreateParams {
  name: string;
  self_signup?: 'enabled' | 'restricted' | null;
  auto_leader?: 'first' | 'random' | null;
  group_limit?: number | null;
  sis_group_category_id?: string;
  create_group_count?: number;
  split_group_count?: number;
  [key: string]: unknown;
}

export interface GroupCategoryUpdateParams {
  name?: string;
  self_signup?: 'enabled' | 'restricted' | null;
  auto_leader?: 'first' | 'random' | null;
  group_limit?: number | null;
  sis_group_category_id?: string;
  create_group_count?: number;
  split_group_count?: number;
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

  /** Get a single group category by ID. */
  getGroupCategory(
    groupCategoryId: number | string,
    params?: { include?: string[]; [key: string]: unknown },
  ): APIPromise<GroupCategory> {
    return this._client.get<GroupCategory>(`/group_categories/${groupCategoryId}`, { query: params });
  }

  /** List users in a group (paginated). */
  listUsers(
    groupId: number | string,
    params?: {
      search_term?: string;
      include?: string[];
      per_page?: number;
      [key: string]: unknown;
    },
  ): PagePromise<User> {
    return this._client.getAPIList<User>(`/groups/${groupId}/users`, { query: params });
  }

  /** List group categories for a course (paginated). */
  listGroupCategories(
    courseId: number | string,
    params?: { per_page?: number; [key: string]: unknown },
  ): PagePromise<GroupCategory> {
    return this._client.getAPIList<GroupCategory>(`/courses/${courseId}/group_categories`, { query: params });
  }

  /** List groups in a group category (paginated). */
  listGroupsInCategory(
    groupCategoryId: number | string,
    params?: { per_page?: number; [key: string]: unknown },
  ): PagePromise<Group> {
    return this._client.getAPIList<Group>(`/group_categories/${groupCategoryId}/groups`, { query: params });
  }

  /** List groups in a course (paginated). */
  listForCourse(
    courseId: number | string,
    params?: { per_page?: number; [key: string]: unknown },
  ): PagePromise<Group> {
    return this._client.getAPIList<Group>(`/courses/${courseId}/groups`, { query: params });
  }

  /** Create a group in a group category. */
  create(
    groupCategoryId: number | string,
    params: GroupCreateParams,
  ): APIPromise<Group> {
    return this._client.post<Group>(`/group_categories/${groupCategoryId}/groups`, { body: params });
  }

  /** Update a group. */
  update(groupId: number | string, params: GroupUpdateParams): APIPromise<Group> {
    return this._client.put<Group>(`/groups/${groupId}`, { body: params });
  }

  /** Delete a group. */
  delete(groupId: number | string): APIPromise<Group> {
    return this._client.delete<Group>(`/groups/${groupId}`);
  }

  /** Create a group category in a course. */
  createGroupCategory(
    courseId: number | string,
    params: GroupCategoryCreateParams,
  ): APIPromise<GroupCategory> {
    return this._client.post<GroupCategory>(`/courses/${courseId}/group_categories`, { body: params });
  }

  /** Update a group category. */
  updateGroupCategory(
    groupCategoryId: number | string,
    params: GroupCategoryUpdateParams,
  ): APIPromise<GroupCategory> {
    return this._client.put<GroupCategory>(`/group_categories/${groupCategoryId}`, { body: params });
  }

  /** Delete a group category. */
  deleteGroupCategory(groupCategoryId: number | string): APIPromise<GroupCategory> {
    return this._client.delete<GroupCategory>(`/group_categories/${groupCategoryId}`);
  }

  /** List memberships in a group (paginated). */
  listMemberships(
    groupId: number | string,
    params?: { filter_states?: string[]; per_page?: number; [key: string]: unknown },
  ): PagePromise<GroupMembership> {
    return this._client.getAPIList<GroupMembership>(`/groups/${groupId}/memberships`, { query: params });
  }

  /** Get a single group membership. */
  getMembership(
    groupId: number | string,
    membershipId: number | string,
  ): APIPromise<GroupMembership> {
    return this._client.get<GroupMembership>(`/groups/${groupId}/memberships/${membershipId}`);
  }

  /** Create a group membership. */
  createMembership(
    groupId: number | string,
    params: { user_id: number | string; [key: string]: unknown },
  ): APIPromise<GroupMembership> {
    return this._client.post<GroupMembership>(`/groups/${groupId}/memberships`, { body: params });
  }

  /** Update a group membership. */
  updateMembership(
    groupId: number | string,
    membershipId: number | string,
    params: { workflow_state?: 'accepted'; moderator?: boolean; [key: string]: unknown },
  ): APIPromise<GroupMembership> {
    return this._client.put<GroupMembership>(`/groups/${groupId}/memberships/${membershipId}`, { body: params });
  }

  /** Delete a group membership. */
  deleteMembership(
    groupId: number | string,
    membershipId: number | string,
  ): APIPromise<GroupMembership> {
    return this._client.delete<GroupMembership>(`/groups/${groupId}/memberships/${membershipId}`);
  }
}
