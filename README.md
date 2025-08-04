# http-with-fetch
<a href="https://pkg-size.dev/http-with-fetch"><img src="https://pkg-size.dev/badge/bundle/1283" title="Bundle size for http-with-fetch"></a>

A tiny abstraction over building featureful wrappers over the `fetch` API.

## Installation

```sh
npm i http-with-fetch
```

## Usage

```ts
import { CredentialsManager, createApiClient } from "http-with-fetch";

class DefaultCredentialsManager implements CredentialsManager {
  async attach(init: RequestInit, url: string) {
    init.credentials = "include";
    return { init, url };
  }
  async isValid(_: Request, res: Response) {
    if (res.status === 401) {
      return false;
    }
    return true;
  }
}

const visitor = {
  async ok(response: Response) {
    return response.json();
  },
  async fail(request: Request, response: Response) {
    let error = await response.json();
    if (process.env.NODE_ENV !== "production") {
      console.error("API Call Failed: ", error, request);
    }
    throw new Error(error);
  },
};

const credentials = new DefaultCredentialsManager();

const client = createApiClient({ credentials, visitor }, false);

const list = client.get("/resource", { limit: 10 });
```

## API Documentation

For comprehensive API documentation, including all types, interfaces, and methods, see [API.md](./API.md).

## Testing with TestHarness

The library includes a `TestHarness` class for mocking HTTP requests in your tests using Node.js's built-in test framework.

Keep in mind, the harness currently only works when use `client.execute`.

```ts
import { test } from "node:test";
import { TestCredentialsManager, TestHarness } from "http-with-fetch/harness";
import { createApiClient } from "http-with-fetch";

test("should mock API calls", (t) => {
  const credentials = new TestCredentialsManager();
  const client = createApiClient({ credentials, visitor: TestCredentialsManager.Visitor }, false);
  
  // Create a test harness that mocks the client's execute method
  const harness = new TestHarness(
    client,
    t, // test context
    (req) => {
      // Default response handler - return mock data based on request
      if (req.url.includes("/users")) {
        return { users: [{ id: 1, name: "John" }] };
      }
      return { message: "Not found" };
    }
  );

  // Now your client calls will use the mocked responses
  const users = await client.execute({ method: "GET", url: "/users" });
  console.log(users); // { users: [{ id: 1, name: "John" }] }

  // You can change mock responses for specific test scenarios
  harness.setMockResponses((req) => {
    return { error: "Server error" };
  });

  // Reset to default behavior
  harness.reset();

  // Access the underlying mock for assertions
  const mock = harness.getMock();
  console.log(mock.mock.callCount()); // Number of calls made
});
```
