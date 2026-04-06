# Canvas LMS Node

A modern TypeScript SDK for the [Canvas LMS REST API](https://canvas.instructure.com/doc/api/), inspired by the design philosophy of [openai-node](https://github.com/openai/openai-node).

- **Zero runtime dependencies** — uses native `fetch` (Node 20+)
- **Full TypeScript types** for every resource and parameter
- **Automatic pagination** via Canvas Link-header (`for await...of`)
- **Retry with backoff** for rate limits (429) and server errors (5xx)
- **String IDs** by default (`Accept: application/json+canvas-string-ids`)

## Installation

```bash
npm install canvas-lms-node
```

## Quick Start

```typescript
import CanvasLMS from "canvas-lms-node";

const client = new CanvasLMS({
  apiKey: process.env["CANVAS_API_KEY"],
  baseURL: process.env["CANVAS_BASE_URL"],
});

// Get the current user
const me = await client.users.getSelf();
console.log(me.name);

// List courses with auto-pagination
for await (const course of client.courses.list()) {
  console.log(course.name);
}
```

## Configuration

| Option       | Default                   | Description                                               |
| ------------ | ------------------------- | --------------------------------------------------------- |
| `apiKey`     | `CANVAS_API_KEY` env var  | Canvas API access token                                   |
| `baseURL`    | `CANVAS_BASE_URL` env var | Canvas instance URL                                       |
| `timeout`    | `60000`                   | Request timeout in ms                                     |
| `maxRetries` | `2`                       | Max retries for 429/5xx                                   |
| `perPage`    | `100`                     | Default page size                                         |
| `logLevel`   | `'warn'`                  | `'debug'` \| `'info'` \| `'warn'` \| `'error'` \| `'off'` |

## Resources

### Courses

```typescript
const courses = await client.courses.list();
const course = await client.courses.get(courseId);
const created = await client.courses.create(accountId, {
  course: { name: "My Course" },
  enroll_me: true,
});
await client.courses.update(courseId, { course: { name: "Renamed" } });
await client.courses.delete(courseId, { event: "delete" });
```

### Assignments

```typescript
for await (const a of client.assignments.list(courseId)) {
  console.log(a.name, a.points_possible);
}
const assignment = await client.assignments.get(courseId, assignmentId);
const created = await client.assignments.create(courseId, {
  assignment: { name: "HW1", points_possible: 100, published: true },
});
```

### Submissions

```typescript
const subs = await client.submissions.list(courseId, assignmentId);
const sub = await client.submissions.get(courseId, assignmentId, userId);

// Grade with rubric assessment
await client.submissions.update(courseId, assignmentId, userId, {
  submission: { posted_grade: "92" },
  comment: { text_comment: "Well done!" },
  rubric_assessment: {
    criterion_1: { points: 45, comments: "Excellent analysis" },
  },
});
```

### Users & Enrollments

```typescript
const me = await client.users.getSelf();
const user = await client.users.get(userId);

for await (const enrollment of client.enrollments.list(courseId)) {
  console.log(enrollment.type, enrollment.user?.name);
}
```

### Sections, Modules, Groups, Rubrics, Files

```typescript
const sections = await client.sections.list(courseId);
const modules = await client.modules.list(courseId);
const items = await client.modules.listItems(courseId, moduleId);
const groups = await client.groups.list();
const rubrics = await client.rubrics.list(courseId);
const files = await client.files.listForCourse(courseId);
```

## Pagination

Canvas uses Link-header pagination. All `list*()` methods return a `PagePromise` that implements `AsyncIterable`:

```typescript
// Auto-paginate with for-await
for await (const course of client.courses.list({ per_page: 10 })) {
  console.log(course.name);
}

// Manual page control
const page = await client.courses.list();
console.log(page.getPaginatedItems()); // first page items
console.log(page.hasNextPage()); // boolean
const next = await page.getNextPage(); // next LinkPage
```

## Error Handling

```typescript
import {
  NotFoundError,
  AuthenticationError,
  RateLimitError,
} from "canvas-lms-node";

try {
  await client.courses.get(999999);
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log("Course not found:", err.status);
  }
  if (err instanceof RateLimitError) {
    console.log("Rate limited — SDK retries automatically");
  }
}
```

Error hierarchy:

- `CanvasLMSError` — base
  - `APIError` (status, headers, error)
    - `BadRequestError` (400)
    - `AuthenticationError` (401)
    - `PermissionDeniedError` (403)
    - `NotFoundError` (404)
    - `ConflictError` (409)
    - `UnprocessableEntityError` (422)
    - `RateLimitError` (429)
    - `InternalServerError` (≥500)
  - `APIConnectionError`
    - `APIConnectionTimeoutError`
  - `APIUserAbortError`

## Response Metadata

```typescript
// Get the raw Response
const response = await client.users.getSelf().asResponse();
console.log(response.headers.get("x-request-cost"));

// Get both data and response
const { data, response } = await client.users.getSelf().withResponse();
```

## Development

```bash
# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Run integration tests (requires .env with CANVAS_API_KEY and CANVAS_BASE_URL)
npm test

# Build
npm run build
```

## License

Apache-2.0
