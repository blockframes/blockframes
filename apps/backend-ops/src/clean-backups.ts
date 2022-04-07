import { runInBackground } from '@blockframes/firebase-utils';

export async function cleanBackups({ bucketName, maxDays }: { bucketName: string, maxDays: string }) {
  if (!bucketName) throw 'This command needs GCS URI starting with gs:// preceeded by an integer number of days to keep backups';

  const maxMilliseconds = 1000 * 60 * 60 * 24 * parseInt(maxDays);

  const output = await runInBackground(`gsutil ls ${bucketName}`).procPromise;
  const URIs = output.split('\n').filter(line => !!line);
  const deleteURIs = URIs.filter(uri => {
    const dir = uri
      .split('/')
      .filter(chunk => !!chunk)
      .pop();

    if (!dir.match(/\d{1,2}-\d{1,2}-\d\d\d\d/)) return false;

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
