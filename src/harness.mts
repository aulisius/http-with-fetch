import type { Mock, TestContext } from "node:test";
import type { Client, RequestDescription } from "./client.mjs";

type ResponseMatcher = (req: RequestDescription) => any;

export class TestHarness<T extends boolean = false> {
  private defaultResponseHandler: ResponseMatcher;
  private mock: Mock<Client<T>["execute"]>;

  constructor(
    client: Client<T>,
    testContext: TestContext,
    defaultResponseHandler: ResponseMatcher
  ) {
    this.mock = testContext.mock.method(client, "execute");
    this.defaultResponseHandler = defaultResponseHandler;
    this.setMockResponses(this.defaultResponseHandler);
  }

  setMockResponses(res: ResponseMatcher) {
    this.mock.mock.mockImplementation(res);
  }

  reset() {
    this.setMockResponses(this.defaultResponseHandler);
    this.mock.mock.resetCalls();
  }

  getMock() {
    return this.mock;
  }
}
