import { once } from "node:events";
import { createServer } from "node:http";
import { createConnection, type AddressInfo } from "node:net";
import type { rm } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import { closeTestHttpServer, removeDirectoryWithRetries } from "./test-cleanup.js";

function createFsError(code: string): NodeJS.ErrnoException {
  const error = new Error(`rm failed with ${code}`) as NodeJS.ErrnoException;
  error.code = code;
  return error;
}

describe("removeDirectoryWithRetries", () => {
  it("retries transient file lock errors before succeeding", async () => {
    const remove = vi
      .fn()
      .mockRejectedValueOnce(createFsError("EBUSY"))
      .mockRejectedValueOnce(createFsError("EPERM"))
      .mockResolvedValue(undefined);
    const sleep = vi.fn().mockResolvedValue(undefined);

    await removeDirectoryWithRetries("/tmp/dev-browser-test", {
      rm: remove as unknown as typeof rm,
      sleep,
      retryDelayMs: (attempt) => [25, 50][attempt] ?? 100,
    });

    expect(remove).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 25);
    expect(sleep).toHaveBeenNthCalledWith(2, 50);
  });

  it("does not retry non-transient removal errors", async () => {
    const remove = vi.fn().mockRejectedValue(createFsError("EACCES"));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(
      removeDirectoryWithRetries("/tmp/dev-browser-test", {
        rm: remove as unknown as typeof rm,
        sleep,
      })
    ).rejects.toMatchObject({ code: "EACCES" });

    expect(remove).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("surfaces the last transient error after exhausting retries", async () => {
    const remove = vi.fn().mockRejectedValue(createFsError("EBUSY"));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(
      removeDirectoryWithRetries("/tmp/dev-browser-test", {
        rm: remove as unknown as typeof rm,
        sleep,
        maxRetries: 2,
        retryDelayMs: () => 10,
      })
    ).rejects.toMatchObject({ code: "EBUSY" });

    expect(remove).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });
});

describe("closeTestHttpServer", () => {
  it.each(["preconnected", "unfinished request"])(
    "closes a %s client without waiting for browser shutdown",
    async (state) => {
      const server = createServer(() => {
        // An intentionally unfinished response models an in-flight browser request.
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const accepted = once(server, "connection");
      const client = createConnection({
        host: "127.0.0.1",
        port: (server.address() as AddressInfo).port,
      });
      const connected = once(client, "connect");
      client.resume();
      let deadline: ReturnType<typeof setTimeout> | undefined;
      try {
        await accepted;
        await connected;
        if (state === "unfinished request") {
          const requested = once(server, "request");
          client.write("GET / HTTP/1.1\r\nHost: localhost\r\n\r\n");
          await requested;
        }
        const disconnected = once(client, "close");
        await Promise.race([
          Promise.all([closeTestHttpServer(server), disconnected]),
          new Promise<never>((_, reject) => {
            deadline = setTimeout(() => reject(new Error("HTTP teardown did not settle")), 1_000);
          }),
        ]);
        expect(server.listening).toBe(false);
        expect(client.destroyed).toBe(true);
      } finally {
        clearTimeout(deadline);
        client.destroy();
        // Release all test resources even when the regression is deliberately reproduced.
        const closed = new Promise<void>((resolve) => server.close(() => resolve()));
        server.closeAllConnections();
        await closed;
      }
    }
  );
});
