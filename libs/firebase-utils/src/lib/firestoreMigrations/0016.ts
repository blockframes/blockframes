import { Firestore } from '../types';

/**
 * Update last version in contract documents
 */
export async function upgrade(db: Firestore) {
  const contracts = await db.collection('contracts').get();
  const batch = db.batch();

  for (const contractDoc of contracts.docs) {
    const contractData = contractDoc.data();
    const contractVersions = await db.collection(`contracts/${contractData.id}/versions`).get();

    let highestId = 0;
    let lastVersion;
    contractVersions.docs.forEach(versionDoc => {
      const versionData = versionDoc.data();
      if (versionData.count) { // _meta document is no more needed
        batch.delete(versionDoc.ref);
      } else {
        // id is now an integer
        const updatedVersion = { ...versionData, id: parseInt(versionData.id, 10) };
        batch.set(versionDoc.ref, updatedVersion);

        // calculate last version to put on contractDoc
        if (updatedVersion.id > highestId) {
          highestId = updatedVersion.id;
          lastVersion = updatedVersion;
        }
      }
    });

    // Set last version directly on contract document
    if (!!lastVersion && !contractData.lastVersion) {
      contractData.lastVersion = lastVersion;
      batch.set(contractDoc.ref, contractData);
    }

  };

  await batch.commit();
  console.log('Updating contract collection done.');
}
