import { Firestore } from '../admin';
/**
 * Update appAcces in organization documents
 */
export async function updateOrgStructure(db: Firestore) {
  const orgs = await db.collection('orgs').get();

  const newOrgData = orgs.docs.map(async (orgDocSnapshot: any): Promise<any> => {
    const orgData = orgDocSnapshot.data();
    const newData = {...orgData};

    if(!newData.appAccess) {
      newData.appAccess = {
        catalogDashboard: true,
        catalogMarketplace: true,
      }

      return orgDocSnapshot.ref.set(newData);
    }

  });
  await Promise.all(newOrgData);
  console.log('Updating appAccess in organization documents done.');
}

/**
 * Update status in distributionDeals documents.
 */
export async function updateDistributionDealsStructure(db: Firestore) {
  const deals = await db.collectionGroup('distributionDeals').get();

  const newDealData = deals.docs.map(async (dealDocSnapshot: any): Promise<any> => {
    const dealData = dealDocSnapshot.data();
    const newData = {...dealData};

    if(!newData.status) {
      newData.status = 'draft';
      return dealDocSnapshot.ref.set(newData);
    }

  });
  await Promise.all(newDealData);
  console.log('Updating status in distributionDeals documents done.');
}

export async function upgrade(db: Firestore) {
  await updateOrgStructure(db);
  await updateDistributionDealsStructure(db);
}
