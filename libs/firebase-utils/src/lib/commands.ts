import { ChildProcess, spawn, SpawnOptions, exec } from 'child_process';

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

/**
 * This function will await a given string to be output to terminal
 * by supplied process before resolving promise.
 * @param proc `ChildProcess` object of running process
 * @param output string to search for to resolve promise upon detection
 */
export function awaitProcOutput(proc: ChildProcess, output: string) {
  return new Promise(res => {
    const reg = new RegExp(output, 'i')
    proc.stdout.on('data', (out: Buffer) => {
      const lines = out.toString().split('\n');
      const match = lines.find((line) => reg.test(line));
      if (match) res();
    });
  })
}

/**
 * This is a backup method when shell output does not work. This method will return the shell output as a
 * string. It returns a promise and also the proc, to enable multi-tasking.
 * NOTE: This may still be 'blocking' as it might not spawn a new thread.
 * @param cmd shell cmd to run
 */
export function runInBackground(cmd: string) {
  let proc: ChildProcess;
  const procPromise = new Promise((res, rej) => {
    proc = exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) rej(err || stderr);
      res(stdout);
    })
  })
  return { proc, procPromise }
}
