# API Reference

## Table of Contents

- [Core API (`http-with-fetch`)](#core-api-http-with-fetch)
  - [createApiClient](#createapiclient)
  - [Client Interface](#client-interface)
  - [Types](#types)
  - [Interfaces](#interfaces)
  - [Utilities](#utilities)
- [Testing API (`http-with-fetch/harness`)](#testing-api-http-with-fetchharness)
  - [TestHarness](#testharness)
  - [TestCredentialsManager](#testcredentialsmanager)

---

## Core API (`http-with-fetch`)

### createApiClient

Creates an HTTP client with configurable credentials management and response handling.

```ts
function createApiClient<Safe extends boolean>(
  factory: ClientFactory,
  safe: Safe
): Client<Safe>
```

#### Parameters

- **factory**: `ClientFactory` - Configuration object containing:
  - **credentials**: `CredentialsManager` - Handles authentication and request modification
  - **visitor**: `Visitor` - Defines how to handle successful and failed responses
- **safe**: `boolean` - Whether to return errors in a tuple format instead of throwing

#### Returns

`Client<Safe>` - HTTP client instance

#### Example

```ts
const client = createApiClient({ credentials, visitor }, false);
```

---

### Client Interface

The main HTTP client interface with methods for making requests.

```ts
interface Client<Safe extends boolean> {
  call<T>(method, url, qs?, body?, headers?): Result<T, Safe>;
  execute<T>(contract: RequestDescription): Result<T, Safe>;
  get<T>(url, qs?, body?): Result<T, Safe>;
  post<T>(url, qs?, body?): Result<T, Safe>;
  delete<T>(url, qs?, body?): Result<T, Safe>;
  postBody<T>(url, body): Result<T, Safe>;
  put<T>(url, body): Result<T, Safe>;
}
```

#### Methods

##### `call<T>(method, url, qs?, body?, headers?)`

Generic method for making HTTP requests.

- **method**: `HttpMethod` - HTTP method ("GET" | "POST" | "PUT" | "DELETE")
- **url**: `string` - Request URL
- **qs**: `Query` - Query parameters (optional)
- **body**: `Body` - Request body (optional)
- **headers**: `Headers | Record<string, string>` - Request headers (optional)

##### `execute<T>(contract)`

Execute a request using a request description object.

- **contract**: `RequestDescription` - Complete request configuration

##### `get<T>(url, qs?, body?)`

Make a GET request.

- **url**: `string` - Request URL
- **qs**: `Query` - Query parameters (optional)
- **body**: `Body` - Request body (optional)

##### `post<T>(url, qs?, body?)`

Make a POST request.

- **url**: `string` - Request URL
- **qs**: `Query` - Query parameters (optional)
- **body**: `Body` - Request body (optional)

##### `delete<T>(url, qs?, body?)`

Make a DELETE request.

- **url**: `string` - Request URL
- **qs**: `Query` - Query parameters (optional)
- **body**: `Body` - Request body (optional)

##### `postBody<T>(url, body)`

Make a POST request with only body (no query parameters).

- **url**: `string` - Request URL
- **body**: `Body` - Request body

##### `put<T>(url, body)`

Make a PUT request.

- **url**: `string` - Request URL
- **body**: `Body` - Request body

#### Return Types

All methods return `Result<T, Safe>`:

- If `Safe` is `false`: Returns `Promise<T>` (throws on error)
- If `Safe` is `true`: Returns `Promise<[T, null] | [null, Error]>` (tuple format)

---

### Types

#### `HttpMethod`

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
```

Supported HTTP methods.

#### `Query`

```ts
type Query = Record<string, any>;
```

Type for query parameters. Values can be strings, numbers, arrays, etc.

#### `Body`

```ts
type Body = URLSearchParams | FormData | Query;
```

Supported request body types:
- `URLSearchParams` - For form-encoded data
- `FormData` - For multipart form data
- `Query` - Plain object (automatically JSON-stringified)

#### `RequestDescription`

```ts
type RequestDescription = {
  method: HttpMethod;
  url: string;
  qs?: Query;
  body?: Body;
  headers?: Headers | Record<string, string>;
};
```

Complete description of an HTTP request.

#### `Result<T, Safe>`

```ts
type Result<T, Safe extends boolean> = Promise<
  Safe extends true ? [T, Error] : T
>;
```

Return type that varies based on the `Safe` parameter:
- `Safe = false`: `Promise<T>`
- `Safe = true`: `Promise<[T, null] | [null, Error]>`

---

### Interfaces

#### `CredentialsManager`

Interface for handling authentication and request modification.

```ts
interface CredentialsManager {
  refresh: () => Promise<void>;
  isValid: (req: Request, res: Response) => Promise<boolean>;
  attach: (
    init: RequestInit,
    url?: string
  ) => WithCredentials | Promise<WithCredentials>;
}
```

##### Methods

- **refresh()**: Called when credentials need to be refreshed
- **isValid(req, res)**: Determines if the current response indicates valid credentials
- **attach(init, url)**: Modifies the request with credentials/authentication

#### `Visitor`

Interface for handling response processing.

```ts
interface Visitor {
  ok: <T>(response: Response) => Promise<T>;
  fail: <T>(request: Request, response: Response) => Promise<T>;
}
```

##### Methods

- **ok(response)**: Processes successful responses (2xx status codes)
- **fail(request, response)**: Processes failed responses (non-2xx status codes)

---

### Utilities

#### `addQueryParamsToUrl`

```ts
function addQueryParamsToUrl(url: string, queryParams: Query = {}): string
```

Utility function to append query parameters to a URL.

- **url**: `string` - Base URL
- **queryParams**: `Query` - Parameters to append

Returns the URL with query parameters appended.

##### Example

```ts
addQueryParamsToUrl("/api/users", { page: 1, limit: 10 });
// Returns: "/api/users?page=1&limit=10"
```

---

## Testing API (`http-with-fetch/harness`)

### TestHarness

Class for mocking HTTP requests in tests using Node.js's built-in test framework.

```ts
class TestHarness<T extends boolean = false> {
  constructor(
    client: Client<T>,
    testContext: TestContext,
    defaultResponseHandler: ResponseMatcher
  );
  setMockResponses(res: ResponseMatcher): void;
  reset(): void;
  getMock(): Mock<Client<T>["execute"]>;
}
```

#### Constructor Parameters

- **client**: `Client<T>` - The client instance to mock
- **testContext**: `TestContext` - Node.js test context
- **defaultResponseHandler**: `ResponseMatcher` - Default function to handle mocked requests

#### Methods

##### `setMockResponses(res)`

Change the mock response handler.

- **res**: `ResponseMatcher` - New response handler function

##### `reset()`

Reset the mock to use the default response handler and clear call history.

##### `getMock()`

Get access to the underlying Node.js mock for assertions.

Returns: `Mock<Client<T>["execute"]>`

#### `ResponseMatcher`

```ts
type ResponseMatcher = (req: RequestDescription) => any;
```

Function type for handling mocked requests. Receives a request description and should return the mocked response data.

#### Example

```ts
import { test } from "node:test";
import { TestHarness } from "http-with-fetch/harness";

test("API calls", (t) => {
  const harness = new TestHarness(
    client,
    t,
    (req) => {
      if (req.url.includes("/users")) {
        return { users: [{ id: 1, name: "John" }] };
      }
      return { error: "Not found" };
    }
  );

  // Use client.execute() - other methods won't be mocked
  const result = await client.execute({ method: "GET", url: "/users" });

  // Access mock for assertions
  const mock = harness.getMock();
  assert.strictEqual(mock.mock.callCount(), 1);
});
```

### TestCredentialsManager

A simple credentials manager implementation for testing.

```ts
class TestCredentialsManager implements CredentialsManager {
  static Visitor: Visitor;
  refresh(): Promise<void>;
  attach(init: RequestInit, url?: string): Promise<WithCredentials>;
  isValid(): Promise<boolean>;
}
```

#### Static Properties

- **Visitor**: Pre-configured visitor object for JSON responses

#### Methods

- **refresh()**: No-op implementation
- **attach(init, url)**: Returns credentials unchanged
- **isValid()**: Always returns `true`

#### Example

```ts
import { TestCredentialsManager } from "http-with-fetch/harness";

const credentials = new TestCredentialsManager();
const client = createApiClient({
  credentials,
  visitor: TestCredentialsManager.Visitor
}, false);
```

---

## Error Handling

### Safe Mode

When `safe` is set to `true`, the client returns errors in tuple format instead of throwing:

```ts
const client = createApiClient(factory, true);

const [data, error] = await client.get("/api/data");
if (error) {
  console.error("Request failed:", error);
} else {
  console.log("Data:", data);
}
```

### Unsafe Mode

When `safe` is set to `false`, the client throws errors:

```ts
const client = createApiClient(factory, false);

try {
  const data = await client.get("/api/data");
  console.log("Data:", data);
} catch (error) {
  console.error("Request failed:", error);
}
```

---

## Authentication Flow

The library supports automatic credential refresh:

1. Request is made with current credentials via `CredentialsManager.attach()`
2. If response is successful, `Visitor.ok()` processes the response
3. If response fails, `CredentialsManager.isValid()` checks if it's an auth issue
4. If invalid credentials are detected, `CredentialsManager.refresh()` is called
5. Request is retried with refreshed credentials
6. If still failing, `Visitor.fail()` processes the error

This flow enables seamless token refresh and other authentication patterns.
