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

export interface UserProfile {
  id: number | string;
  name: string;
  short_name: string;
  sortable_name: string;
  title?: string | null;
  bio?: string | null;
  primary_email?: string;
  login_id?: string;
  sis_user_id?: string | null;
  integration_id?: string | null;
  avatar_url?: string;
  calendar?: { ics?: string; [key: string]: unknown };
  time_zone?: string;
  locale?: string | null;
  pronouns?: string | null;
  [key: string]: unknown;
}

export interface UserCreateParams {
  user: {
    name: string;
    short_name?: string;
    sortable_name?: string;
    time_zone?: string;
    locale?: string;
    terms_of_use?: boolean;
    skip_registration?: boolean;
    [key: string]: unknown;
  };
  pseudonym: {
    unique_id: string;
    password?: string;
    sis_user_id?: string;
    integration_id?: string;
    send_confirmation?: boolean;
    force_self_registration?: boolean;
    authentication_provider_id?: string;
    [key: string]: unknown;
  };
  communication_channel?: {
    type?: string;
    address?: string;
    confirmation_url?: boolean;
    skip_confirmation?: boolean;
    [key: string]: unknown;
  };
}

export interface UserUpdateParams {
  user: {
    name?: string;
    short_name?: string;
    sortable_name?: string;
    time_zone?: string;
    email?: string;
    locale?: string;
    avatar?: { token?: string; url?: string; [key: string]: unknown };
    title?: string;
    bio?: string;
    pronouns?: string;
    [key: string]: unknown;
  };
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

  /** Get a user's profile. */
  getProfile(userId: number | string): APIPromise<UserProfile> {
    return this._client.get<UserProfile>(`/users/${userId}/profile`);
  }

  /** Create a new user in an account. */
  create(accountId: number | string, params: UserCreateParams): APIPromise<User> {
    return this._client.post<User>(`/accounts/${accountId}/users`, { body: params });
  }

  /** Update a user. */
  update(userId: number | string, params: UserUpdateParams): APIPromise<User> {
    return this._client.put<User>(`/users/${userId}`, { body: params });
  }
}
