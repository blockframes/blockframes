import { Firestore } from '../admin';

/**
 * Rename a key in a SIMPLE object. pure function: returns a NEW object,
 * with SHALLOW cloning.
 *
 * @param m: object (mapping)
 * @param k: old key name
 * @param newK: new key name
 */
const renameKey = (m: { [key: string]: any }, k: string, newK: string) => {
  const result = { ...m };
  result[newK] = result[k];
  delete result[k];
  return result;
};

export async function upgrade(db: Firestore) {
  const permissions = await db.collection('permissions').get();
  const batch = db.batch();

  const updates = permissions.docs.map(async permission => {
    // delete userAppsPermissions
    const appsPerms = await permission.ref.collection('userAppsPermissions').get();
    appsPerms.forEach(appPerm => {
      batch.delete(appPerm.ref);
    });

    // delete userDocsPermission
    const userDocPerms = await permission.ref.collection('userDocsPermissions').get();
    userDocPerms.forEach(userDocPerm => {
      batch.delete(userDocPerm.ref);
    });

    // rename orgDocsPermissions
    const orgDocPerms = await permission.ref.collection('orgDocsPermissions').get();
    orgDocPerms.forEach(orgDocPerm => {
      const newRef = permission.ref.collection('documentPermissions').doc(orgDocPerm.id);

      const data = orgDocPerm.data();

      const newData = renameKey(data, 'owner', 'ownerId');
      batch.set(newRef, newData);

      const { id, owner } = data;

      if (orgDocPerm.ref.path.includes(owner)) {
        // there's only one owner for a document, prevents pushing multiple time the same doc.
        const indexRef = db.collection('docsIndex').doc(id);
        batch.set(indexRef, { authorOrgId: owner });
      }

      // and delete!
      batch.delete(orgDocPerm.ref);
    });
  });

  await Promise.all(updates);
  return batch.commit();
}
