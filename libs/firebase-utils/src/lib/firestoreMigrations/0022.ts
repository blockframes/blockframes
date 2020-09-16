import { Firestore } from '../types';

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

// For a specific organization for the e2e test
const festivalAppAccess = (org) => {
  if ((org.id === 'B10P335uag5cUsDT1VGk' || org.id === 'e1VXeusNJK6pb8kmVnUn') && org.denomination.full === 'main') {
    return  {
      dashboard: false,
      marketplace: true
    }
  } else if (org.id === 'jnbHKBP5YLvRQGcyQ8In' && org.denomination.full === 'main') {
    return {
      dashboard: true,
      marketplace: false
    }
  } else {
    return {
      dashboard: false,
      marketplace: false
    }
  }
};

function updateOrganization(org: any) {
  const previous = org.appAccess;
  const updatedOrg = { ...org };
  delete updatedOrg.appAccess;

  updatedOrg.appAccess = {
    catalog: {
      dashboard: previous.catalogDashboard ? previous.catalogDashboard : false,
      marketplace: previous.catalogMarketplace ? previous.catalogMarketplace : false
    },
    festival: festivalAppAccess(updatedOrg)
  };

  return updatedOrg;
}
