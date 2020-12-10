import { ChildProcess, spawn, SpawnOptions } from 'child_process';

export function runShellCommand(cmd: string) {
  process.env.FORCE_COLOR = 'true';
  const spawnSettings: SpawnOptions = { env: Object.create(process.env), shell: true };
  return new Promise((res, rej) => {
    const proc = spawn(cmd, spawnSettings);
    proc.stdout.pipe(process.stdout);
    process.stdin.pipe(proc.stdin);
    process.on('SIGTERM', () => proc.kill('SIGTERM'));
    process.on('SIGINT', () => proc.kill('SIGINT'));
    process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
    process.on('SIGHUP', () => proc.kill('SIGHUP'));
    proc.on('error', rej);
    proc.on('exit', (code) => (code === 0 ? res : rej));
    proc.stdout.on('close', res);
    proc.stdout.on('exit', res);
  });
}

export function runShellCommandUntil(cmd: string, until: string) {
  process.env.FORCE_COLOR = 'true';
  const spawnSettings: SpawnOptions = { env: Object.create(process.env), shell: true };
  const proc = spawn(cmd, spawnSettings);
  proc.stdout.pipe(process.stdout);
  process.stdin.pipe(proc.stdin);
  process.on('SIGTERM', () => proc.kill('SIGTERM'));
  process.on('SIGINT', () => proc.kill('SIGINT'));
  process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
  process.on('SIGHUP', () => proc.kill('SIGHUP'));
  const reg = new RegExp(until, 'i')
  const procPromise = new Promise((res, rej) => {
    proc.on('error', rej);
    proc.on('exit', (code) => (code === 0 ? res : rej));
    proc.stdout.on('close', res);
    proc.stdout.on('exit', res);
    proc.stdout.on('data', (out: Buffer) => {
      const lines = out.toString().split('\n');
      const match = lines.find((line) => reg.test(line));
      if (match) res();
    });
  });
  return { proc, procPromise }
}

export function waitForProcOutput(proc: ChildProcess, output: string) {
  return new Promise(res => {
    const reg = new RegExp(output, 'i')
    proc.stdout.on('data', (out: Buffer) => {
      const lines = out.toString().split('\n');
      const match = lines.find((line) => reg.test(line));
      if (match) res();
    });
  })
}
