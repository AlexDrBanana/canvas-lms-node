import { APIResource } from '../core/resource.js';
import type { PagePromise } from '../core/pagination.js';
import type { APIPromise } from '../core/api-promise.js';

// --- Types ---

export interface CanvasFile {
  id: number | string;
  uuid: string;
  folder_id: number | string;
  display_name: string;
  filename: string;
  'content-type'?: string;
  content_type?: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
  unlock_at?: string | null;
  locked?: boolean;
  hidden?: boolean;
  lock_at?: string | null;
  hidden_for_user?: boolean;
  thumbnail_url?: string | null;
  modified_at?: string;
  mime_class?: string;
  media_entry_id?: string | null;
  locked_for_user?: boolean;
  preview_url?: string | null;
  [key: string]: unknown;
}

export interface FileListParams {
  content_types?: string[];
  exclude_content_types?: string[];
  search_term?: string;
  include?: string[];
  only?: string[];
  sort?: 'name' | 'size' | 'created_at' | 'updated_at' | 'content_type' | 'user';
  order?: 'asc' | 'desc';
  per_page?: number;
  [key: string]: unknown;
}

// --- Resource ---

export class Files extends APIResource {
  /** Get a single file by ID. */
  get(fileId: number | string, params?: { include?: string[] }): APIPromise<CanvasFile> {
    return this._client.get<CanvasFile>(`/files/${fileId}`, { query: params });
  }

  /** Delete a file. */
  delete(fileId: number | string): APIPromise<CanvasFile> {
    return this._client.delete<CanvasFile>(`/files/${fileId}`);
  }

  /** List files for a course (paginated). */
  listForCourse(courseId: number | string, params?: FileListParams): PagePromise<CanvasFile> {
    return this._client.getAPIList<CanvasFile>(`/courses/${courseId}/files`, { query: params });
  }

  /** List files for a folder (paginated). */
  listForFolder(folderId: number | string, params?: FileListParams): PagePromise<CanvasFile> {
    return this._client.getAPIList<CanvasFile>(`/folders/${folderId}/files`, { query: params });
  }

  /** List files for a user (paginated). */
  listForUser(userId: number | string, params?: FileListParams): PagePromise<CanvasFile> {
    return this._client.getAPIList<CanvasFile>(`/users/${userId}/files`, { query: params });
  }
}
