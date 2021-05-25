import { Firestore, QueryDocumentSnapshot, QuerySnapshot, Transaction } from '../types';
import { pickBy } from 'lodash';
import { PLACEHOLDER_LOGO } from '@blockframes/organization/+state/organization.firestore';

export const withoutUndefined = x => pickBy(x, value => value !== undefined);

/**
 * Lets you select values from an item while configuring default values.
 *
 * Select all the keys from defaultValues in item,
 * if a value is undefined, uses the default Value.
 *
 * selectAndMergeValues({a: undefined, b: 2, c: true}, {a: 42, c: false}) => {a: 42, c: true}
 */
const selectAndMergeValues = (item, defaultValues) => {
  const result = { ...defaultValues };

  Object.keys(defaultValues).forEach(key => {
    if (item[key] !== undefined) {
      result[key] = item[key];
    }
  });

  return result;
};

function upgradeUser(user: QueryDocumentSnapshot, orgRights: any, tx: Transaction) {
  const defaultValues = {
    name: 'John',
    surname: 'Doe',
    orgId: orgRights.docs[0].data().orgId
  };

  const newData = selectAndMergeValues(user.data(), defaultValues);
  tx.update(user.ref, newData);
  // TODO: trash org rights
}

function upgradeOrg(org: QueryDocumentSnapshot, tx: Transaction) {
  const defaultValues = {
    status: 'pending',
    members: [],
    logo: PLACEHOLDER_LOGO
  };
  const newData = selectAndMergeValues(org.data(), defaultValues);
  tx.update(org.ref, newData);
}


async function gatherOrgRights(users: QuerySnapshot, tx: Transaction) {
  const orgRights = await Promise.all(
    users.docs.map(async doc => {
      return {
        userId: doc.id,
        orgRights: await tx.get(doc.ref.collection('orgRights'))
      };
    })
  );

  return orgRights;
}

export async function upgrade(db: Firestore) {
  // NOTE: you need to get ALL the data before making an update,
  // it might be more sensible to update document per document (tricky for x-document info)
  // or work at the org level / movie / app level?
  const usersQuery = db.collection('users');
  const orgsQuery = db.collection('orgs');

  await db.runTransaction(async tx => {
    const users = await tx.get(usersQuery);
    const orgs = await tx.get(orgsQuery);
    const orgRightsMapping = await gatherOrgRights(users, tx);
    // Upgrade users
    console.log('upgrading users');
    users.forEach(doc =>
      upgradeUser(doc, orgRightsMapping.find(x => x.userId === doc.id).orgRights, tx)
    );

    // Upgrade orgs
    console.log('upgrading orgs');
    orgs.forEach(doc => upgradeOrg(doc, tx));
  });
}
