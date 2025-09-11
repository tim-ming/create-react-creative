import { execa, ExecaChildProcess } from 'execa';

export async function waitForOk(url: string, timeoutMs = 60_000, intervalMs = 300) {
  const deadline = Date.now() + timeoutMs;
  while (true) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // do nothing
    }
    if (Date.now() > deadline) throw new Error(`Server not ready at ${url} within ${timeoutMs}ms`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export async function startDev(npmFlags: string[], cwd: string, port = 5179) {
  const child: ExecaChildProcess = execa(
    'npm',
    [...npmFlags, 'run', 'dev', '--', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd, stdio: 'pipe' }
  );
  const url = `http://127.0.0.1:${port}/`;
  await waitForOk(url);
  return {
    url,
    child,
    async stop() {
      try {
        child.kill('SIGTERM', { forceKillAfterTimeout: 2000 });
      } catch {
        // do nothing
      }
    },
  };
}
