import { Firestore } from '../types';

/**
 * Create missing movies documentPermissions.
 */
export async function upgrade(db: Firestore) {
  const organizations = await db.collection('orgs').get();

  // Iterate on each organization
  organizations.forEach(async orgSnap => {
    const org = orgSnap.data();
    const permissionDocuments = await db.collection(`permissions/${org.id}/documentPermissions`).get();
    const permissionDocumentsIds = [];

    permissionDocuments.forEach(docSnap => permissionDocumentsIds.push(docSnap.data().id))
    org.movieIds.forEach(movieId => {
      if (!permissionDocumentsIds.includes(movieId)) {
        const moviePermissions = createDocumentPermissions(movieId, org.id);
        db.doc(`permissions/${org.id}/documentPermissions/${movieId}`).set(moviePermissions);
      }
    })
  })

  console.log('Updating permissionDocuments done.');
}

// Create a permission document with all permissions set to true and ownership.
function createDocumentPermissions(docId: string, orgId: string) {
  return {
    canCreate: true,
    canDelete: true,
    canRead: true,
    canUpdate: true,
    id: docId,
    isAdmin: true,
    ownerId: orgId
  }
}
