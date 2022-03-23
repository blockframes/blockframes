import { runInBackground } from '@blockframes/firebase-utils';

export async function cleanBackups({ bucketName, maxDays }) {
  if (!bucketName) throw 'This command needs GCS URI starting with gs:// preceeded by an integer number of days to keep backups';

  const maxMilliseconds = 1000 * 60 * 60 * 24 * maxDays;

  const output = await runInBackground(`gsutil ls ${bucketName}`).procPromise;
  const URIs = output.split('\n').filter(line => Boolean(line));
  const deleteURIs = URIs.filter(uri => {
    const dir = uri
      .split('/')
      .filter(chunk => Boolean(chunk))
      .pop();

    if (!dir.match(/\d\d-\d\d-\d\d\d\d/)) return false;

    const [day, month, year] = dir.split('-').slice(-3);
    const date = new Date(`${month}-${day}-${year}`);
    const now = new Date();
    const elapsed = now.getTime() - date.getTime();
    return elapsed > maxMilliseconds;
  });

  for (const uri of deleteURIs) {
    const cmd = `gsutil -m rm -r ${uri}`;
    console.log(cmd);
    const output = await runInBackground(cmd).procPromise;
    console.log(output);
  }
}
