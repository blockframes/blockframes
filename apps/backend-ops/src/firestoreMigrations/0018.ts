import { Firestore } from '../admin';

/**
 * Update the distributionDeals subcollection (rename in distributionRights)
 */
export async function distributionRightRenaming(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  const updates = movies.docs.map(async movie => {
    const distributionDeals = await movie.ref.collection('distributionDeals').get();

    if (distributionDeals) {
      // Create new sub collection named Distribution Rights
      distributionDeals.forEach(right => {
        const rightRef = movie.ref.collection('distributionRights').doc(right.id);
        const newRight = JSON.parse(JSON.stringify(right.data()));
        batch.set(rightRef, newRight);

        // Update terms because of the timestamp type in firestore
        const endTermData = right.data().terms.end;
        const startTermData = right.data().terms.start;
        const newTerms = {
          end: new Date((endTermData._seconds + endTermData._nanoseconds) * 1000),
          start: new Date((startTermData._seconds + startTermData._nanoseconds) * 1000),
        };
        if (endTermData || startTermData) {
          batch.update(rightRef, {terms: newTerms});
        }
      });

      // And delete the old Distribution Deals
      distributionDeals.forEach(deal => {
        batch.delete(deal.ref);
      })
    };
  });
  console.log('Creation of subcollection Distribution Rights and deletion of distribution deals');

  await Promise.all(updates);
  return batch.commit();
}

/**
 * Update the distributionDeals in contract collection (rename in distributionRights)
 */
export async function rightInContract(db: Firestore) {
  const contracts = await db.collection('contracts').get();

  const newContractData = contracts.docs.map(async (contractDocSnapshot: any): Promise<any> => {
    const contractData = contractDocSnapshot.data();
    const newData = { ...contractData };

    const { lastVersion } = contractData;

    if (lastVersion?.titles) {

      Object.keys(contractData.lastVersion.titles).forEach(titleId => {
        if (contractData.lastVersion.titles[titleId].distributionDealIds) {

          const distributionDealIds = contractData.lastVersion.titles[titleId].distributionDealIds;
          delete contractData.lastVersion.titles[titleId].distributionDealIds;

          contractData.lastVersion.titles[titleId] = {
            ...contractData.lastVersion.titles[titleId],
            distributionRightIds : distributionDealIds
          };
        }
      })
      return contractDocSnapshot.ref.set(newData);
    }

  })
  await Promise.all(newContractData);
  console.log('Updating contract collection done.');
}

/**
 * Update the distributionDeals in contractVersion subcollection (rename in distributionRights)
 */
export async function rightInContractVersion(db: Firestore) {
  const versions = await db.collectionGroup('versions').get();

  const updates = versions.docs.map(async (versionDocSnapshot: any): Promise<any> => {
    const versionData = versionDocSnapshot.data();
    const newData = { ...versionData };

    if (versionData.titles) {

      Object.keys(versionData.titles).forEach(titleId => {
        if (versionData.titles[titleId].distributionDealIds) {

          const distributionDealIds = versionData.titles[titleId].distributionDealIds;

          delete versionData.titles[titleId].distributionDealIds;

          versionData.titles[titleId] = {
            ...versionData.titles[titleId],
            distributionRightIds : distributionDealIds
          }
        }
      });

      return versionDocSnapshot.ref.set(newData);
    }
  });

  console.log('Updating contract version subcollection done.');
  await Promise.all(updates);
}

export async function upgrade(db: Firestore) {
  await distributionRightRenaming(db);
  await rightInContract(db);
  await rightInContractVersion(db);
}
