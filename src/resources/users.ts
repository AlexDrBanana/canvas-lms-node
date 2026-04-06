import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';

// --- Types ---

export interface User {
  id: number | string;
  name: string;
  sortable_name?: string;
  short_name?: string;
  sis_user_id?: string | null;
  sis_import_id?: number | string | null;
  integration_id?: string | null;
  login_id?: string;
  email?: string;
  avatar_url?: string;
  enrollments?: unknown[];
  locale?: string | null;
  last_login?: string | null;
  time_zone?: string;
  bio?: string | null;
  pronouns?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export interface UserListParams {
  search_term?: string;
  enrollment_type?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  include?: string[];
  per_page?: number;
  [key: string]: unknown;
}

// --- Resource ---

export class Users extends APIResource {
  /** Get the current user's profile. */
  getSelf(): APIPromise<User> {
    return this._client.get<User>('/users/self');
  }

  /** Get a user by ID. */
  get(userId: number | string, params?: { include?: string[] }): APIPromise<User> {
    return this._client.get<User>(`/users/${userId}`, { query: params });
  }

  /** List users in an account (paginated). Requires admin access. */
  list(params?: UserListParams & { accountId?: number | string }): PagePromise<User> {
    const accountId = params?.accountId ?? 'self';
    const { accountId: _, ...query } = params ?? {};
    return this._client.getAPIList<User>(`/accounts/${accountId}/users`, { query });
  }
}
