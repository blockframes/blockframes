import { spawn, SpawnOptions } from 'child_process';

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
