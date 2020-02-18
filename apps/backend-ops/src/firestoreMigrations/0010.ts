import { Firestore } from '../admin';

export async function upgrade(db: Firestore) {
  const batch = db.batch();

  // remove all movies, documents, etc.
  const movies = await db.collection('movies').get();
  movies.docs.forEach(x => batch.delete(x.ref));

  const index = await db.collection('docsIndex').get();
  index.docs.forEach(x => batch.delete(x.ref));

  const perms = await db.collection('permissions').get();

  await Promise.all(
    perms.docs.map(async p => {
      const documentPerms = await p.ref.collection('documentPermissions').get();
      documentPerms.docs.forEach(d => batch.delete(d.ref));
    })
  );

  return await batch.commit();
}
