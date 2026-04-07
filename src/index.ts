export { CanvasLMS, default } from './client.js';
export type { ClientOptions } from './client.js';

// Core
export { APIPromise } from './core/api-promise.js';
export { LinkPage, PagePromise } from './core/pagination.js';
export { APIResource } from './core/resource.js';

// Errors
export {
  CanvasLMSError,
  APIError,
  BadRequestError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
} from './core/error.js';

// Resources
export {
  Courses,
  Assignments,
  Submissions,
  Users,
  Enrollments,
  Files,
  Groups,
  Rubrics,
  Sections,
  Modules,
} from './resources/index.js';

// Resource types
export type {
  Course,
  CourseListParams,
  CourseCreateParams,
  CourseUpdateParams,
} from './resources/courses.js';

export type {
  Assignment,
  AssignmentListParams,
  AssignmentCreateParams,
  AssignmentUpdateParams,
  AssignmentOverride,
  AssignmentOverrideCreateParams,
  AssignmentOverrideUpdateParams,
} from './resources/assignments.js';

export type {
  Submission,
  SubmissionAttachment,
  RubricAssessmentEntry,
  SubmissionComment,
  SubmissionListParams,
  SubmissionUpdateParams,
  SubmissionCreateParams,
} from './resources/submissions.js';

export type {
  User,
  UserListParams,
  UserProfile,
  UserCreateParams,
  UserUpdateParams,
} from './resources/users.js';

export type {
  Enrollment,
  EnrollmentListParams,
  EnrollmentCreateParams,
} from './resources/enrollments.js';


export type { CanvasFile, FileListParams, FileUpdateParams } from './resources/files.js';

export type {
  Group,
  GroupCategory,
  GroupMembership,
  GroupCreateParams,
  GroupUpdateParams,
  GroupCategoryCreateParams,
  GroupCategoryUpdateParams,
} from './resources/groups.js';

export type {
  Rubric,
  RubricCriterion,
  RubricRating,
  RubricListParams,
  RubricCreateParams,
  RubricUpdateParams,
} from './resources/rubrics.js';

export type { Section, SectionListParams } from './resources/sections.js';


export type {
  Module,
  ModuleItem,
  ModuleListParams,
  ModuleCreateParams,
  ModuleUpdateParams,
  ModuleItemCreateParams,
  ModuleItemUpdateParams,
} from './resources/modules.js';
