import { CI_STORAGE_BACKUP, getBackupBucket, latestAnonDbDir, loadAdminServices } from "@blockframes/firebase-utils";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";
import { backupBucket } from 'env/env.blockframes-ci'
import type { Bucket } from "@google-cloud/storage";
import type { firestore, storage } from "firebase-admin";

export async function healthCheck() {
  // tslint:disable-next-line: no-shadowed-variable
  const { db, storage, getCI } = loadAdminServices();
  // * Do we have storage CRUD access to our own storage backup bucket?
  const backupStorageAccess = await checkBackupBucketAccess(storage)
  console.log(`Local Backup Bucket - CREATE FILE: ${backupStorageAccess.create ? 'ALLOW' : 'DENY'}`)
  console.log(`Local Backup Bucket - GET FILE: ${backupStorageAccess.get ? 'ALLOW' : 'DENY (will not work without CREATE)'}`)
  console.log(`Local Backup Bucket - DELETE FILE: ${backupStorageAccess.del ? 'ALLOW' : 'DENY (will not work without CREATE)'}`)
  console.log(`Local Backup Bucket - LIST FILE: ${backupStorageAccess.list ? 'ALLOW' : 'DENY'}`)

  // * Do we have write access to tmp directory?
  const fileAccess = checkDiskWriteAccess()
  console.log(`Local tmp Folder - WRITE: ${fileAccess.write ? 'ALLOW' : 'DENY'}`)
  console.log(`Local tmp Folder - READ: ${fileAccess.read ? 'ALLOW' : 'DENY'}`)

  // * Do we have get access to CI storage db backups?
  const CIAccess = await checkCIBucketAccess(getCI().storage())
  console.log(`CI Backup Bucket - GET FILE: ${CIAccess.get ? 'ALLOW' : 'DENY'}`)
  console.log(`CI Backup Bucket - LIST FILE: ${CIAccess.list ? 'ALLOW' : 'DENY'}`)

  // * Do we have get access to CI storage backups?
  const CIStorageBackupAccess = await checkCIStorageBackupBucketAccess(getCI().storage())
  console.log(`CI Storage Backup Bucket - GET FILE: ${CIStorageBackupAccess.get ? 'ALLOW' : 'DENY'}`)
  console.log(`CI Storage Backup Bucket - LIST FILE: ${CIStorageBackupAccess.list ? 'ALLOW' : 'DENY'}`)

  // * Do we have access to our own firestore?
  const firestoreAccess = await checkFirestoreAccess(db)
  console.log(`Firestore Access: ${firestoreAccess ? 'ALLOW' : 'DENY'}`)

}

async function checkFirestoreAccess(db: firestore.Firestore) {
  try {
    await db.listCollections()
    return true;
  } catch (e) {
    return false;
  }
}

async function checkCIStorageBackupBucketAccess(gcs: storage.Storage) {
  const bucket = gcs.bucket(CI_STORAGE_BACKUP);

  let list = false;
  let get = false;
  let file = '';

  try {
    const [files] = await bucket.getFiles()
    list = true
    file = files.pop().name;
  } catch (e) { void 0 }

  try {
    await bucket.file(file).download()
    get = true;
  } catch (e) { void 0 }

  return { list, get }
}

async function checkBackupBucketAccess(gcs: storage.Storage) {
  let create = false;
  let list = false;
  let del = false;
  let get = false;

  const fileName = 'test-file.tmp';

  let bucket: Bucket;

  try {
    bucket = await getBackupBucket(gcs)
    const writeStream = bucket.file(fileName).createWriteStream()
    writeStream.write('test')
    await new Promise(res => writeStream.end(res))
    create = true;
    await bucket.file(fileName).download()
    get = true;
    await bucket.file(fileName).delete().catch()
    del = true;
  } catch (e) { void 0 }

  try {
    bucket = await getBackupBucket(gcs)
    await bucket.getFiles()
    list = true
  } catch (e) { void 0 }

  return { create, list, del, get }
}

function checkDiskWriteAccess() {
  let read = false;
  let write = false;

  const filePath = resolve(process.cwd(), 'tmp', 'test-file.tmp')
  try {
    writeFileSync(filePath, 'test')
    write = true;
    readFileSync(filePath, 'utf-8')
    read = true;
  } catch (e) { void 0 }

  unlinkSync(filePath)

  return { read, write }
}

async function checkCIBucketAccess(gcs: storage.Storage) {
  const bucket = gcs.bucket(backupBucket)
  let list = false;
  let get = false;

  try {
    await bucket.file(`${latestAnonDbDir}/LATEST-ANON-DB.overall_export_metadata`).download();
    get = true;
  } catch (e) { void 0 }

  try {
    await bucket.getFiles();
    list = true
  } catch (e) { void 0 }

  return { list, get }
}
