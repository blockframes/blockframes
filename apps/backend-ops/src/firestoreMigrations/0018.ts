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
    const { lastVersion } = contractData;

    if (lastVersion?.titles) {

      const newTitles = Object.keys(contractData.lastVersion.titles).map(titleId => {
        const distributionDealIds = contractData.lastVersion.titles[titleId].distributionDealIds;
        delete contractData.lastVersion.titles[titleId].distributionDealIds;

        return contractData.lastVersion.titles[titleId] = {
          ...contractData.lastVersion.titles[titleId],
          distributionRightIds : distributionDealIds
        };
      })

      const newData = {
        ...contractData,
        lastVersion: {
          ...contractData.lastVersion,
          titles: newTitles
        }
      }
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
  const contracts = await db.collection('contracts').get();
  const batch = db.batch();

  const updates = contracts.docs.map(async contract => {
    const versionDoc = await contract.ref.collection('version').get();

    if (versionDoc) {}
  });

  console.log('Updating contract version subcollection done.');
}

export async function upgrade(db: Firestore) {
  await distributionRightRenaming(db);
  await rightInContract(db);
  await rightInContractVersion(db);
}
