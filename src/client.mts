type Query = Record<string, any>;
type Body = URLSearchParams | FormData | Query;

type Result<T, Safe extends boolean> = Promise<
  Safe extends true ? [T, Error] : T
>;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RequestDescription = {
  method: HttpMethod;
  url: string;
  qs?: Query;
  body?: Body;
  headers?: Headers | Record<string, string>;
};

interface Client<Safe extends boolean> {
  call<T>(
    method: HttpMethod,
    url: string,
    qs?: Query,
    body?: Body,
    headers?: Headers | Record<string, string>
  ): Result<T, Safe>;
  execute<T>(contract: RequestDescription): Result<T, Safe>;
  get<T>(url: string, qs?: Query, body?: Body): Result<T, Safe>;
  post<T>(url: string, qs?: Query, body?: Body): Result<T, Safe>;
  delete<T>(url: string, qs?: Query, body?: Body): Result<T, Safe>;
  postBody<T>(url: string, body: Body): Result<T, Safe>;
  put<T>(url: string, body: Body): Result<T, Safe>;
}

export interface Visitor {
  ok: <T>(response: Response) => Promise<T>;
  fail: <T>(request: Request, response: Response) => Promise<T>;
}

type WithCredentials = { init: RequestInit; url: string };

export interface CredentialsManager {
  refresh: () => Promise<void>;
  isValid: (req: Request, res: Response) => Promise<boolean>;
  attach: (
    init: RequestInit,
    url?: string
  ) => WithCredentials | Promise<WithCredentials>;
}

type ClientFactory = { visitor: Visitor; credentials: CredentialsManager };

export function addQueryParamsToUrl(
  url: string,
  queryParams: Query = {}
): string {
  const parsedUrl = new URL(url, globalThis.location?.origin);
  url = url.replace(parsedUrl.search, "");
  let search = parsedUrl.searchParams;
  for (const [key, values] of Object.entries(queryParams)) {
    if (values !== undefined) {
      [].concat(values).forEach((value) => search.append(key, value));
    }
  }
  let qs = search.toString();
  return qs.length === 0 ? url : `${url}?${qs}`;
}

function createRequestInit(
  method: string,
  body: Body,
  headers: Headers | Record<string, string>
): RequestInit {
  let init: Partial<RequestInit> = { method, headers };
  if (body?.constructor?.name !== "Object" && !Array.isArray(body)) {
    init.body = body as Exclude<Body, Query>;
    return init;
  }
  init.headers["content-type"] = "application/json";
  if (body) {
    init.body = JSON.stringify(body);
  }
  return init;
}

async function unwrap<T, Safe extends boolean>(
  cb: () => Promise<T>,
  safe: Safe
): Result<T, Safe> {
  try {
    let ok = await cb();
    // @ts-ignore
    return safe ? [ok, null] : ok;
  } catch (cause) {
    let error = new Error(cause.message, { cause });
    if (safe) {
      // @ts-ignore
      return [null as T, error] as const;
    }
    throw error;
  }
}

async function execute(credentials: WithCredentials) {
  let request = new Request(credentials.url, credentials.init);
  let response = await fetch(request);
  return [request, response] as const;
}

export function createApiClient<Safe extends boolean>(
  factory: ClientFactory,
  safe: Safe
): Client<Safe> {
  const { visitor, credentials } = factory;
  async function call<T>(
    method: HttpMethod,
    url: string,
    qs: Query = {},
    body: Body,
    headers: Headers | Record<string, string> = {}
  ) {
    let init = createRequestInit(method, body, headers);
    let withQs = addQueryParamsToUrl(url, qs);
    let [request, response] = await execute(
      await credentials.attach({ ...init }, withQs)
    );
    if (response.ok) {
      return unwrap(() => visitor.ok(response), safe);
    }
    let isValid = await credentials.isValid(request, response);
    if (!isValid) {
      let refresh = await unwrap(() => credentials.refresh(), safe);
      if (safe) {
        return refresh;
      }
      [request, response] = await execute(
        await credentials.attach({ ...init }, withQs)
      );
      if (response.ok) {
        return unwrap(() => visitor.ok(response), safe);
      }
    }
    return unwrap(() => visitor.fail(request, response), safe);
  }
  return {
    call,
    execute: <T,>(req: RequestDescription) =>
      call<T>(req.method, req.url, req.qs, req.body, req.headers),
    get: <T,>(url: string, qs: Query, body: Body) =>
      call<T>("GET", url, qs, body),
    post: <T,>(url: string, qs: Query, body: Body) =>
      call<T>("POST", url, qs, body),
    delete: <T,>(url: string, qs: Query, body: Body) =>
      call<T>("DELETE", url, qs, body),
    postBody: <T,>(url: string, body: Body) => call<T>("POST", url, {}, body),
    put: <T,>(url: string, body: Body) => call<T>("PUT", url, {}, body),
  } as Client<Safe>;
}
