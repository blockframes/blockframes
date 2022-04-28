import { ChildProcess, spawn, SpawnOptions, exec } from 'child_process';
import { sleep } from './util';

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

export function awaitProcessExit(proc: ChildProcess) {
  return new Promise((res, rej) => {
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
  const procPromise = new Promise<void>((res, rej) => {
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
  return new Promise<void>(res => {
    const reg = new RegExp(output, 'i');
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
  const procPromise = new Promise<string>((res, rej) => {
    const { env } = process;
    proc = exec(cmd, { maxBuffer: 1000 * 1000 * 2, env }, (err, stdout) => {
      if (err) rej(err);
      res(stdout);
    });
  })
  return { proc, procPromise }
}

export function runShellCommandExec(cmd: string) {
  console.log('Running command:', cmd);
  const { proc, procPromise } = runInBackground(cmd);
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
  return procPromise;
}

/**
 * WARNING - if not using `rsync` and enabling `mirror`, this command will WIPE
 * the destination URL. So if you specify the root of a GCS bucket, that whole bucket
 * will be deleted. Be careful!
 * @param param0 settings object
 * @returns a promise which is resolved when transfer is complete
 */
export async function gsutilTransfer({ from, to, quiet, rsync = true, mirror, exclude }: { from: string; to: string; quiet?: boolean; rsync?: boolean; mirror?: boolean, exclude?: string }) {
  let cmd: string;

  const run = quiet ? cmd => keepAlive(runShellCommandExec(cmd)) : runShellCommandExec;

  if (!rsync && mirror) {
    cmd = `gsutil -m ${quiet ? '-q ' : ''}rm -r "${to}"`;
    await run(cmd);
  }
  cmd = `gsutil -m ${quiet ? '-q ' : ''}${rsync ? 'rsync' : 'cp'} ${rsync && mirror ? '-d ' : ''}${exclude ? `-x "${exclude}" ` : ''}-r "${from}" "${to}"`;
  return run(cmd);
}

export async function keepAlive<T>(promise: Promise<T>) {
  let running = true;
  async function timer(s: number) {
    while (running) {
      console.log('Process is running quietly...');
      await sleep(1000 * s);
    }
  }
  await Promise.race([promise, timer(60)]);
  running = false;
  return promise;
}
