import { Firestore } from '../types';


/**
 * Update denomination in organization documents
 */
export async function upgrade(db: Firestore) {
  const organizations = await db.collection('orgs').get();

  const newOrgData = organizations.docs.map(async (orgDocSnapshot: any): Promise<any> => {
    const organizationData = orgDocSnapshot.data();
    const { name } = organizationData;

    if (organizationData.name) {
      delete organizationData.name;

      const newData = {
        ...organizationData,
        denomination: {
          full: name,
          public: name
        },
      };

      return orgDocSnapshot.ref.set(newData);
    }
  });

  await Promise.all(newOrgData);
  console.log('Updating organization collection done.');
}
