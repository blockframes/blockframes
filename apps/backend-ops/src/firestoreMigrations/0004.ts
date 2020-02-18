import { Firestore } from '../admin';

const orgAppAccessMapping = {
  jnbHKBP5YLvRQGcyQ8In: { catalogDashboard: true, catalogMarketplace: true },
  vcyZAPBMZaxyDsszeMZo: { catalogDashboard: true, catalogMarketplace: true },
  sLchj1Ib4Cxhwr0ZBW4m: { catalogDashboard: true, catalogMarketplace: false },
  B10P335uag5cUsDT1VGk: { catalogDashboard: false, catalogMarketplace: true },
  crcwtaCywM09U45evkuA: { catalogDashboard: false, catalogMarketplace: true },
  Gmjs8f9vRr68EbbyBSc6: { catalogDashboard: false, catalogMarketplace: true },
  SuF2np4mlqpHCmUfj42G: { catalogDashboard: false, catalogMarketplace: true },
  MjvTm9y69EPRjZyjsOap: { catalogDashboard: false, catalogMarketplace: true },
  J3yEyNgAUaN0wlix84Wk: { catalogDashboard: false, catalogMarketplace: true },
  uCkMfQ99t6qQtxfJqdvm: { catalogDashboard: true, catalogMarketplace: true },
  e1VXeusNJK6pb8kmVnUn: { catalogDashboard: true, catalogMarketplace: true },
  bzyMG1qBpWjkXfTB4F2r: { catalogDashboard: true, catalogMarketplace: false }
};

/**
 * Update appAcces in organization documents
 */
export async function updateOrgStructure(db: Firestore) {
  const orgs = await db.collection('orgs').get();

  const newOrgData = orgs.docs.map(
    async (orgDocSnapshot: any): Promise<any> => {
      const orgData = orgDocSnapshot.data();
      const newData = { ...orgData };

      if (!newData.appAccess) {
        if (orgAppAccessMapping[orgDocSnapshot.ref.id]) {
          newData.appAccess = orgAppAccessMapping[orgDocSnapshot.ref.id];
        } else {
          newData.appAccess = { catalogDashboard: true, catalogMarketplace: true };
        }

        return orgDocSnapshot.ref.set(newData);
      }
    }
  );
  await Promise.all(newOrgData);
  console.log('Updating appAccess in organization documents done.');
}

/**
 * Update status in distributionDeals documents.
 */
export async function updateDistributionDealsStructure(db: Firestore) {
  const deals = await db.collectionGroup('distributionDeals').get();

  const newDealData = deals.docs.map(
    async (dealDocSnapshot: any): Promise<any> => {
      const dealData = dealDocSnapshot.data();
      const newData = { ...dealData };

      if (!newData.status) {
        newData.status = 'draft';
        return dealDocSnapshot.ref.set(newData);
      }
    }
  );
  await Promise.all(newDealData);
  console.log('Updating status in distributionDeals documents done.');
}

export async function upgrade(db: Firestore) {
  await updateOrgStructure(db);
  await updateDistributionDealsStructure(db);
}
