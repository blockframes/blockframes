import { Firestore } from '../admin';

export async function updateOrgAppAccess(db: Firestore) {
  const orgs = await db.collection('orgs').get();
  const batch = db.batch();

  const updates = orgs.docs.map(doc => {
    const org = doc.data();

    if (!org.appAccess.catalog) {
      const newData = updateOrganization(org);
      return batch.set(doc.ref, newData);
    }
  });

  await Promise.all(updates);
  return batch.commit();
}

export async function upgrade(db: Firestore) {
  await updateOrgAppAccess(db);
  console.log('Updated org appAccess OK !');
}

function updateOrganization(org: any) {
  const previous = org.appAccess;
  const updatedOrg = { ...org };
  delete updatedOrg.appAccess;

  updatedOrg.appAccess = {
    catalog: {
      dashboard: previous.catalogDashboard ? previous.catalogDashboard : false,
      marketplace: previous.catalogMarketplace ? previous.catalogMarketplace : false
    },
    festival:
      // For a specific organization for the e2e test
      org.id === 'jnbHKBP5YLvRQGcyQ8In' && org.denomination.full === 'main'
        ? {
            dashboard: true,
            marketplace: false
          }
        : {
            dashboard: false,
            marketplace: false
          }
  };

  return updatedOrg;
}
