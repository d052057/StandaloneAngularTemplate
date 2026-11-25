// dev-tools.mjs - cross-platform helpers used by .vscode/tasks.json (Windows, Linux, WSL)
//   node dev-tools.mjs free 4200 5001    stop whatever listens on these TCP ports
//   node dev-tools.mjs wait 5001         wait until the port accepts connections
import { execSync } from "node:child_process";
import net from "node:net";

const [cmd, ...args] = process.argv.slice(2);
const ports = args.map(Number).filter(Boolean);

function free(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync("netstat -ano -p tcp", { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        const p = line.trim().split(/\s+/);
        if (p[3] === "LISTENING" && p[1] && p[1].endsWith(":" + port) && p[4] !== "0") pids.add(p[4]);
      }
      for (const pid of pids) {
        try { execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" }); console.log(`stopped PID ${pid} on port ${port}`); } catch {}
      }
    } else {
      execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
      console.log(`freed port ${port}`);
    }
  } catch { /* nothing was listening */ }
}

function tryConnect(host, port) {
  return new Promise((resolve) => {
    const s = net.connect({ host, port });
    s.once("connect", () => { s.destroy(); resolve(true); });
    s.once("error", () => resolve(false));
    s.setTimeout(1500, () => { s.destroy(); resolve(false); });
  });
}

async function wait(port) {
  await new Promise((r) => setTimeout(r, 3000));
  for (let i = 0; i < 150; i++) {
    if ((await tryConnect("127.0.0.1", port)) || (await tryConnect("::1", port))) {
      console.log(`port ${port} is up`);
      return;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.error(`port ${port} did not come up in time`);
  process.exit(1);
}

if (cmd === "free") { ports.forEach(free); await new Promise((r) => setTimeout(r, 1000)); }
else if (cmd === "wait" && ports[0]) await wait(ports[0]);
else { console.error("usage: dev-tools.mjs free <port...> | wait <port>"); process.exit(2); }
