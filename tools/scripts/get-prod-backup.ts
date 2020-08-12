import { backupBucket, firebase } from '../../env/env.prod';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config();

admin.initializeApp({
  storageBucket: backupBucket,
  projectId: firebase.projectId,
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

const storage = admin.storage();

async function getProdBackup() {
  const [files] = await storage.bucket(backupBucket).getFiles();
  const sortableFiles = files.map((file) => ({ file, date: new Date(file.metadata?.timeCreated) }));
  // for (const file of files) {
  //   const date = new Date(file.metadata?.timeCreated);
  //   console.log(date);
  // }
  let latestFile = sortableFiles.pop();
  for (const { date, file } of sortableFiles) {
    if (date > latestFile.date) {
      latestFile = { date, file };
    }
  }
  console.log(`Latest backup: ${latestFile.date}`);
  const destination = `${process.cwd()}/${latestFile.file.name}`;
  await latestFile.file.download({ destination });
  console.log(`Backup has been saved to: ${destination}`);
}

getProdBackup().then(() => process.exit(0));
