type Query = Record<string, any>;
type Body = URLSearchParams | FormData | Query;

type ApiResponse<T, Safe extends boolean> = Promise<
  Safe extends true ? [T, Error] : T
>;

interface Client<Safe extends boolean> {
  call<T>(
    method: string,
    url: string,
    qs?: Query,
    body?: Body
  ): ApiResponse<T, Safe>;
  get<T>(url: string, qs?: Query, body?: Body): ApiResponse<T, Safe>;
  post<T>(url: string, qs?: Query, body?: Body): ApiResponse<T, Safe>;
  delete<T>(url: string, qs?: Query, body?: Body): ApiResponse<T, Safe>;
  postBody<T>(url: string, body: Body): ApiResponse<T, Safe>;
  put<T>(url: string, body: Body): ApiResponse<T, Safe>;
}

export interface Visitor {
  ok: <T>(response: Response) => Promise<T>;
  fail: <T>(request: Request, response: Response) => Promise<T>;
}

export interface CredentialsManager {
  applyRefresh: () => Promise<boolean>;
  isValid: (req: Request, res: Response) => Promise<boolean>;
  attach: (
    init: RequestInit,
    url?: string
  ) => RequestInit | Promise<RequestInit>;
}

type ClientFactory = { visitor: Visitor; credentials: CredentialsManager };

export function addQueryParamsToUrl(
  url: string,
  queryParams: Query = {}
): string {
  const parsedUrl = new URL(url, globalThis.location.origin);
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

function createRequestInit(method: string, body: Body): RequestInit {
  let init: Partial<RequestInit> = { method };
  if (body?.constructor?.name !== "Object") {
    init.body = body as Exclude<Body, Query>;
    return init;
  }
  init.headers = { "content-type": "application/json" };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return init;
}

export function createApiClient<Safe extends boolean>(
  factory: ClientFactory,
  safe: Safe
): Client<Safe> {
  const { visitor, credentials } = factory;
  async function unwrap<T>(cb: () => Promise<T>): Promise<T | [T, Error]> {
    try {
      let ok = await cb();
      return safe ? [ok, null] : ok;
    } catch (cause) {
      let error = new Error(cause.message, { cause });
      error.name = "CallFailed";
      if (safe) {
        return [null, error];
      } else {
        throw error;
      }
    }
  }
  async function call<T>(
    method: string,
    url: string,
    qs: Query = {},
    body: Body
  ) {
    const init = createRequestInit(method, body);
    const fullUrl = addQueryParamsToUrl(url, qs);
    let updatedInit = await credentials.attach({ ...init }, fullUrl);
    let request = new Request(fullUrl, updatedInit);
    let response = await fetch(request);
    if (response.ok) {
      return unwrap<T>(() => visitor.ok(response));
    }
    let isValid = await credentials.isValid(request, response);
    if (!isValid) {
      let isComplete = await credentials.applyRefresh();
      if (!isComplete) {
        let err = new Error("RefreshFailed");
        if (safe) {
          return [null, err];
        }
        throw err;
      }
      let updatedInit = await credentials.attach({ ...init }, fullUrl);
      response = await fetch(new Request(fullUrl, updatedInit));
      if (response.ok) {
        return unwrap<T>(() => visitor.ok(response));
      }
    }
    return unwrap<T>(() => visitor.fail<T>(request, response));
  }
  return {
    call,
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
