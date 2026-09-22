/** Repeatable, isolated acceptance checks for the compiled v1 candidate. */
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import puppeteer from "puppeteer-core";

const chrome = process.argv[2];
const reportPath = process.argv[3];
if (!chrome || !reportPath) throw new Error("Usage: bun scripts/evaluate-compiled.ts CHROME REPORT.json");
const binary = path.resolve(import.meta.dir, "../dist/dev-browser");
const home = fs.mkdtempSync(path.join(os.tmpdir(), "dev-browser-v1-accept-"));
const env = { ...process.env, DEV_BROWSER_HOME: home, DEV_BROWSER_CHROME: chrome } as Record<string, string>;
delete env.NODE_PATH;
delete env.DEV_BROWSER_SOCKET;
const checks: { name: string; passed: boolean; ms: number; detail?: unknown; error?: string }[] = [];
const ownedPids = new Set<number>();
let mcp: ReturnType<typeof Bun.spawn> | undefined;
const startedAt = new Date().toISOString();
const frameServer = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response(
  '<!doctype html><button id="child" onclick="this.textContent=\'Child clicked\'">Child action</button>',
  { headers: { "content-type": "text/html" } },
) });
const server = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response(
  '<!doctype html><title>V1 fixture</title><h1>Local fixture</h1><input id="name" aria-label="Name">' +
  '<button id="apply" onclick="document.title=document.getElementById(&quot;name&quot;).value">Apply</button>' +
  `<iframe src="http://localhost:${frameServer.port}/"></iframe>`,
  { headers: { "content-type": "text/html" } },
) });
const url = `http://127.0.0.1:${server.port}/`;

function alive(pid: number): boolean {
  try { return fs.readFileSync(`/proc/${pid}/stat`, "utf8").split(") ")[1]!.split(" ")[0] !== "Z"; }
  catch { return false; }
}
function rememberDaemon() {
  try { ownedPids.add(Number(fs.readFileSync(path.join(home, "daemon.pid"), "utf8"))); } catch {}
}
async function run(args: string[], timeoutMs = 25_000) {
  const proc = Bun.spawn([binary, ...args], { env, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  const timer = setTimeout(() => proc.kill("SIGKILL"), timeoutMs);
  try {
    const [stdout, stderr, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
    rememberDaemon();
    return { code, stdout, stderr };
  } finally { clearTimeout(timer); }
}
async function script(code: string, flags = ["--headless"]) {
  const r = await run([...flags, "--timeout", "10", "--json", "-e", code]);
  assert.equal(r.code, 0, JSON.stringify(r));
  const frames = r.stdout.trim().split("\n").filter(Boolean).map(line => JSON.parse(line));
  return { data: frames.find(f => f.type === "result")?.data, frames };
}
async function check(name: string, fn: () => Promise<unknown>) {
  const start = Date.now();
  try { checks.push({ name, passed: true, ms: Date.now() - start, detail: await fn() }); }
  catch (error) { checks.push({ name, passed: false, ms: Date.now() - start, error: String(error) }); }
  checks.at(-1)!.ms = Date.now() - start;
  console.log(`${checks.at(-1)!.passed ? "PASS" : "FAIL"} ${name}`);
}

try {
  await check("compiled version", async () => {
    const r = await run(["--version"]); assert.equal(r.code, 0); assert.match(r.stdout, /1\.0\.0-rc\.3/); return r.stdout.trim();
  });
  for (const headless of [true, false]) {
    await check(`${headless ? "headless" : "headed"} native interaction and browser identity`, async () => {
      const { data } = await script(`
        const p = await browser.getPage("form");
        await p.goto(${JSON.stringify(url)});
        await p.fill("#name", "v1-stealth-ok");
        await p.locator("#apply").click();
        const cdp = await p.createCDPSession();
        const identity = await cdp.send("Browser.getVersion");
        const command = await cdp.send("Browser.getBrowserCommandLine");
        await cdp.detach();
        const snap = await p.snapshot();
        const shot = await p.shot({name: "fixture-${headless}.jpg"});
        ({title: await p.title(), webdriver: await p.evaluate(() => navigator.webdriver), identity, command, snapshot: snap, shot})
      `, headless ? ["--headless"] : []);
      assert.equal(data.title, "v1-stealth-ok"); assert.equal(data.webdriver, false);
      assert.equal(data.command.arguments[0], chrome); assert.match(data.snapshot, /Apply/);
      assert.ok(fs.statSync(data.shot.path).size > 1000);
      return { title: data.title, webdriver: data.webdriver, identity: data.identity, executable: data.command.arguments[0], screenshotBytes: fs.statSync(data.shot.path).size };
    });
  }
  await check("named page persists between compiled CLI calls", async () => {
    const { data } = await script('const p = await browser.getPage("form"); ({title: await p.title(), value: await p.$eval("#name", e => e.value)})');
    assert.deepEqual(data, { title: "v1-stealth-ok", value: "v1-stealth-ok" }); return data;
  });
  await check("snapshot refs act across a cross-origin iframe", async () => {
    const { data } = await script(`
      const p = await browser.getPage("frame"); await p.goto(${JSON.stringify(url)});
      const child = await p.waitForFrame(f => f.url().includes(":${frameServer.port}/"));
      await child.waitForSelector("#child");
      const snapshot = await p.snapshot();
      const ref = /button "Child action" \\[ref=(f\\d+e\\d+)\\]/.exec(snapshot)?.[1];
      if (!ref) throw new Error("missing child ref: " + snapshot);
      await p.click("ref/" + ref);
      ({ref, text: await (await p.ref(ref)).evaluate(e => e.textContent)})
    `);
    assert.equal(data.text, "Child clicked"); return data;
  });
  await check("four concurrent scripts retain independent named pages", async () => {
    const values = await Promise.all(Array.from({ length: 4 }, (_, i) => script(`
      const p = await browser.getPage("parallel-${i}"); await p.goto(${JSON.stringify(url)});
      await p.fill("#name", "parallel-${i}"); await p.locator("#apply").click(); await p.title()
    `)));
    assert.deepEqual(values.map(v => v.data), ["parallel-0", "parallel-1", "parallel-2", "parallel-3"]);
    return values.map(v => v.data);
  });
  await check("explicit CDP attachment preserves the external browser on stop", async () => {
    const external = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      userDataDir: path.join(home, "external-profile"),
      args: ["--no-sandbox"],
    });
    try {
      const { data } = await script(`
        const p = await browser.getPage("external"); await p.goto(${JSON.stringify(url)});
        await p.fill("#name", "external-ok"); await p.locator("#apply").click(); await p.title()
      `, ["--connect", external.wsEndpoint()]);
      assert.equal(data, "external-ok");
      const stop = await run(["stop"]); assert.equal(stop.code, 0, stop.stderr);
      assert.ok(external.connected);
      const pages = await external.pages();
      assert.ok((await Promise.all(pages.map(p => p.title()))).includes("external-ok"));
      return { title: data, externalBrowserSurvived: true };
    } finally { await external.close(); }
  });
  await check("deadline exits 124 and next request succeeds", async () => {
    const timed = await run(["--headless", "--timeout", "1", "-e", 'await new Promise(r => setTimeout(r, 3000)); "late"']);
    assert.equal(timed.code, 124, JSON.stringify(timed));
    assert.equal((await script('"recovered"')).data, "recovered"); return { code: timed.code, error: timed.stderr.trim() };
  });
  await check("three immediate stop/start cycles", async () => {
    const pids = [];
    for (let i = 0; i < 3; i++) {
      const stopped = await run(["stop"]); assert.equal(stopped.code, 0, stopped.stderr);
      assert.equal((await script(String(i))).data, i);
      const pid = Number(fs.readFileSync(path.join(home, "daemon.pid"), "utf8")); pids.push(pid);
    }
    assert.equal(new Set(pids).size, 3);
    await Bun.sleep(300);
    assert.equal([...ownedPids].filter(alive).length, 1, "extra live daemon after restart");
    return pids;
  });
  await check("compiled MCP initialize, tools and real browser action", async () => {
    mcp = Bun.spawn([binary, "mcp", "--headless"], { env, stdin: "pipe", stdout: "pipe", stderr: "pipe" });
    const reader = (mcp.stdout as ReadableStream<Uint8Array>).getReader();
    let buffer = "";
    const decoder = new TextDecoder();
    let id = 0;
    async function rpc(method: string, params: unknown) {
      const current = ++id;
      (mcp!.stdin as import("bun").FileSink).write(JSON.stringify({ jsonrpc: "2.0", id: current, method, params }) + "\n");
      let timer: ReturnType<typeof setTimeout>;
      const response = async () => {
        for (;;) {
          let i;
          while ((i = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, i); buffer = buffer.slice(i + 1);
            if (line.trim()) { const msg = JSON.parse(line); if (msg.id === current) return msg; }
          }
          const { value, done } = await reader.read(); if (done) throw new Error("MCP EOF");
          buffer += decoder.decode(value, { stream: true });
        }
      };
      try { return await Promise.race([response(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("MCP timeout")), 20_000); })]); }
      finally { clearTimeout(timer!); }
    }
    try {
      const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "v1-evaluation", version: "1" } });
      assert.equal(init.result.serverInfo.name, "dev-browser");
      (mcp.stdin as import("bun").FileSink).write(JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized"}) + "\n");
      const list = await rpc("tools/list", {});
      assert.ok(list.result.tools.some((t: {name:string}) => t.name === "dev_browser_run"));
      const action = await rpc("tools/call", { name: "dev_browser_run", arguments: { script: `const p = await browser.getPage("mcp"); await p.goto(${JSON.stringify(url)}); await p.fill("#name", "mcp-ok"); await p.locator("#apply").click(); await p.shot({name:"mcp.jpg"}); await p.title()` } });
      assert.equal(action.result.isError, false, JSON.stringify(action));
      assert.ok(action.result.content.some((c: {type:string;text?:string}) => c.type === "text" && c.text?.includes("mcp-ok")));
      assert.ok(action.result.content.some((c: {type:string}) => c.type === "image"));
      return { tools: list.result.tools.map((t: {name:string}) => t.name), imageReturned: true };
    } finally { mcp.kill(); await mcp.exited; }
  });
} finally {
  await check("evaluation runtime cleanup", async () => {
    rememberDaemon();
    const r = await run(["stop"]); assert.equal(r.code, 0, r.stderr);
    const deadline = Date.now() + 10_000;
    while ([...ownedPids].some(alive) && Date.now() < deadline) await Bun.sleep(100);
    const remaining = [...ownedPids].filter(alive); assert.deepEqual(remaining, []);
    assert.ok(!fs.existsSync(path.join(home, "daemon.sock")));
    return { daemonPids: [...ownedPids], remaining };
  });
  server.stop(true); frameServer.stop(true);
  fs.mkdirSync(path.dirname(path.resolve(reportPath)), {recursive:true});
  fs.writeFileSync(reportPath, JSON.stringify({ startedAt, finishedAt: new Date().toISOString(), binary, chrome, home, checks }, null, 2) + "\n");
  if (checks.at(-1)?.passed) fs.rmSync(home, {recursive:true,force:true});
}
process.exitCode = checks.every(c => c.passed) ? 0 : 1;
