import { runChunks } from '../firebase-utils';
import { loadAdminServices } from '../util';
import { Firestore, UserIdentifier, UserRecord } from '../types';
import { PublicUser, DocumentMeta } from '@blockframes/shared/model';

/**
 * Add an empty videos array on orgs.documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const auth = loadAdminServices().auth;

  const query = await db.collection('users').get();
  const users = query.docs.map(doc => doc.data()) as PublicUser[];
  const identifiers: UserIdentifier[] = query.docs.map(doc => {
    return { uid: doc.id };
  });

  const chunks: UserIdentifier[][] = [];
  let i = 0;

  while (i < identifiers.length) {
    chunks.push(identifiers.slice(i, (i += 100)));
  }

  let authUsers: UserRecord[] = [];
  for (const chunk of chunks) {
    const result = await auth.getUsers(chunk);
    authUsers = authUsers.concat(result.users);
  }

  return runChunks(authUsers, authUser => {
    const user = users.find(user => user.uid === authUser.uid);
    const _meta: DocumentMeta<Date | FirebaseFirestore.Timestamp> = {
      emailVerified: authUser.emailVerified,
      createdAt: new Date(authUser.metadata.creationTime),
      ...user._meta,
    };

    if (new Date(authUser.metadata.creationTime) < new Date(2021, 5, 31)) {
      auth.updateUser(authUser.uid, { emailVerified: true });
    }

    return db.doc(`users/${user.uid}`).update({ _meta });
  });
}
