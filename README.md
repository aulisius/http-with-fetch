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
