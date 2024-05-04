import { createApiClient } from "./lib/client.mjs";
import { createServer } from "node:http";
import assert from "node:assert";
import { it, describe } from "node:test";

class DefaultCredentialsManager {
  async attach(init, url) {
    return { init, url };
  }
  async isValid() {
    return true;
  }
}

const credentials = new DefaultCredentialsManager();
const visitor = {
  ok: (res) => res.json(),
  fail: async (req, res) => {
    const error = await res.json();
    throw error;
  },
};

const unsafe = createApiClient({ credentials, visitor }, false);
const safe = createApiClient({ credentials, visitor }, true);

const server = createServer((req, res) => {
  let url = new URL(req.url, `http://${req.headers.host}`);
  let status = url.searchParams.get("status") ?? 200;
  let body = { message: url.searchParams.get("message") ?? "" };
  res.writeHead(Number(status), { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
});

await new Promise((res) => server.listen(8080, res));

server.on("close", () => process.exit(0));

await describe("api client", { concurrency: false }, async () => {
  it("when using unsafe client", async (t) => {
    await t.test("returns response for 2xx", async () => {
      let hello = await unsafe.get("http://localhost:8080/", {
        status: 200,
        message: "Hello World!",
      });
      assert.deepStrictEqual(hello, { message: "Hello World!" });
    });
    await t.test("throws error when response is not 2xx", async () => {
      assert.rejects(
        unsafe.get("http://localhost:8080/", {
          status: 400,
          message: "Bad Request",
        })
      );
    });
  });

  it("when using safe client", async (t) => {
    await t.test("returns no error for 2xx", async () => {
      let [res, err] = await safe.get("http://localhost:8080/", {
        status: 200,
        message: "Hello World!",
      });
      assert.ifError(err);
      assert.deepStrictEqual(res, { message: "Hello World!" });
    });
    await t.test("returns error when response is not 2xx", async () => {
      let [res, err] = await safe.get("http://localhost:8080/", {
        status: 400,
        message: "Bad Request",
      });
      assert.ok(err);
      assert.ifError(res);
      assert.deepStrictEqual(err.cause, { message: "Bad Request" });
    });
  });
});

setTimeout(() => server.emit("close"));
