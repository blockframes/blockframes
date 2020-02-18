import {
  Firestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Transaction,
  DocumentReference
} from '../admin';
import { union, pickBy, identity } from 'lodash';
import { PLACEHOLDER_LOGO } from '@blockframes/organization';

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

/**
 * Build the mapping movieId => [deliveryId1, deliveryId2, ...]
 */
function buildMovieToDeliveryIdsMap(deliveries: QuerySnapshot) {
  const movieIdsToDeliveryIds = {};
  deliveries.forEach(doc => {
    const { movieId } = doc.data();
    const id = doc.id;
    const currents = movieIdsToDeliveryIds[movieId];

    if (currents === undefined) {
      movieIdsToDeliveryIds[movieId] = [id];
    } else {
      movieIdsToDeliveryIds[movieId] = [...currents, id];
    }
  });

  return movieIdsToDeliveryIds;
}

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

function upgradeDelivery(delivery: QueryDocumentSnapshot, tx: Transaction) {
  const defaultValues = {
    _type: 'deliveries',
    mustBeSigned: true,
    mustChargeMaterials: false,
    isPaid: false,
    steps: [],
    validated: [],
    status: delivery.data().state || 'pending'
  };

  const newData = selectAndMergeValues(delivery.data(), defaultValues);
  tx.update(delivery.ref, newData);
}

function upgradeMovie(
  movie: QueryDocumentSnapshot,
  otherDeliveryIds: string[],
  orgIds: string[],
  tx: Transaction
) {
  const data = movie.data();

  const defaultValues = {
    // organization: data.org,
    main: withoutUndefined({
      // isan: data.isan,
      title: data.title,
      poster: data.poster,
      productionYear: data.productionYear,
      genres: data.genres,
      originCountries: [data.originCountry, ...data.coProducerCountries].filter(identity),
      status: data.status
    }),
    story: withoutUndefined({
      logline: data.logline,
      synopsis: data.synopsis
    }),
    promotionalElements: withoutUndefined({
      images: data.images,
      promotionalElements: data.promotionalElements
    }),
    promotionalDescription: withoutUndefined({
      keyAssets: [],
      keywords: data.keywords
    }),
    salesCast: {},
    salesInfo: {},
    versionInfo: {},
    festivalPrizes: {},
    salesAgentDeal: {},
    sales: [],
    distributionRights: []
  };

  const newData = selectAndMergeValues(data, defaultValues);
  const deliveryIds = union(data.deliveryIds, otherDeliveryIds);

  console.log('update with:', newData);

  tx.update(movie.ref, { ...newData, deliveryIds });
}

function upgradeOrg(org: QueryDocumentSnapshot, tx: Transaction) {
  const defaultValues = {
    status: 'pending',
    templateIds: [],
    members: [],
    logo: PLACEHOLDER_LOGO
  };
  const newData = selectAndMergeValues(org.data(), defaultValues);
  tx.update(org.ref, newData);
}

function upgradeOrgPermissions(
  org: QueryDocumentSnapshot,
  permissionRef: DocumentReference,
  stakeholdersMapping: any[],
  tx: Transaction
) {
  console.log('upgrade org permissions:', org.id);
  console.log('stakeholdersMapping:', stakeholdersMapping);

  // First update the permission doc for the delivery
  const { id: orgId, userIds: superAdmins } = org.data();

  const defaultValues = {
    admins: [],
    canCreate: [],
    canDelete: [],
    canRead: [],
    canUpdate: [],
    orgId,
    superAdmins
  };

  const currentData = {}; // assume empty permissions.

  const newData = selectAndMergeValues(currentData, defaultValues);
  tx.set(permissionRef, newData);

  // Second create the permission document for each of its deliveries.
  stakeholdersMapping.forEach(({ owner, deliveryId }) => {
    const permissionDocRef = permissionRef.collection('orgDocsPermissions').doc(deliveryId);

    tx.set(permissionDocRef, {
      owner,
      id: deliveryId,
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      isAdmin: true
    });
  });
}

/**
 * Gather a mapping orgId => [{deliveryId, owner}, ...]
 * for every delivery the organization is a stakeholder of.
 *
 * Used to build permissions.
 *
 * @param deliveries
 * @param tx
 */
async function gatherStakeholders(deliveries: QuerySnapshot, tx: Transaction) {
  const deliveriesWithStakeholder = await Promise.all(
    deliveries.docs.map(async doc => {
      return {
        deliveryId: doc.id,
        stakeholders: await tx.get(doc.ref.collection('stakeholders'))
      };
    })
  );

  const r = {};

  deliveriesWithStakeholder.forEach(({ deliveryId, stakeholders }) => {
    let owner = null;

    stakeholders.forEach(stkDoc => {
      const { orgId } = stkDoc.data();
      owner = owner || orgId; // default to the first stakeholder

      const current = r[orgId];

      if (!current) {
        r[orgId] = [];
      }

      r[orgId] = [...r[orgId], { deliveryId, owner }];
    });
  });

  return r;
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

function gatherMovieIdMapping(orgs) {
  const movieToOrgs = {};

  orgs.docs.forEach(org => {
    const data = org.data();
    const movieIds = data.movieIds;

    movieIds.forEach(movieId => {
      if (movieToOrgs[movieId] === undefined) {
        movieToOrgs[movieId] = [];
      }
      movieToOrgs[movieId] = [...movieToOrgs[movieId], org.id];
    });
  });

  return movieToOrgs;
}

export async function upgradeBis(db: Firestore) {
  // Out of transaction for ease of implem, this script is growing too fast.
  // move movies/stakeholder to use the org id as id

  const movies = await db.collection('movies').get();

  const ps = movies.docs.map(async movieDoc => {
    const stakeholders = await movieDoc.ref.collection('stakeholders').get();

    return stakeholders.docs.map(async stakeholderDoc => {
      const { orgId, orgMovieRole, role, isAccepted } = stakeholderDoc.data();
      await stakeholderDoc.ref.delete();
      await movieDoc.ref
        .collection('stakeholders')
        .doc(orgId)
        .set({ id: orgId, orgMovieRole, role, isAccepted: isAccepted || false });
    });
  });

  await Promise.all(ps);

  // Out of transaction for ease of implem, this script is growing too fast.
  // move deliveries/stakeholder to use the org id as id

  const deliveries = await db.collection('deliveries').get();

  const ps2 = deliveries.docs.map(async doc => {
    const stakeholders = await doc.ref.collection('stakeholders').get();

    return stakeholders.docs.map(async stakeholderDoc => {
      const { orgId, tx, authorizations, isAccepted } = stakeholderDoc.data();
      console.log('stakeholder:', orgId);

      await stakeholderDoc.ref.delete();

      await doc.ref
        .collection('stakeholders')
        .doc(orgId)
        .set(withoutUndefined({ id: orgId, isAccepted: isAccepted || false, tx, authorizations }));
    });
  });

  await Promise.all(ps2);
}

export async function upgrade(db: Firestore) {
  // NOTE: you need to get ALL the data before making an update,
  // it might be more sensible to update document per document (tricky for x-document info)
  // or work at the org level / movie / app level?
  const usersQuery = db.collection('users');
  const deliveriesQuery = db.collection('deliveries');
  const moviesQuery = db.collection('movies');
  const orgsQuery = db.collection('orgs');
  const permissionRef = (orgId: string) => db.collection('permissions').doc(orgId);

  await db.runTransaction(async tx => {
    const users = await tx.get(usersQuery);
    const deliveries = await tx.get(deliveriesQuery);
    const movies = await tx.get(moviesQuery);
    const orgs = await tx.get(orgsQuery);
    const movieIdsToDeliveryIds = buildMovieToDeliveryIdsMap(deliveries);
    const stakeholdersMapping = await gatherStakeholders(deliveries, tx);
    const orgRightsMapping = await gatherOrgRights(users, tx);
    const movieIdOrgsMapping = await gatherMovieIdMapping(orgs);

    // Upgrade users
    console.log('upgrading users');
    users.forEach(doc =>
      upgradeUser(doc, orgRightsMapping.find(x => x.userId === doc.id).orgRights, tx)
    );

    // Upgrade deliveries
    console.log('upgrading deliveries');
    deliveries.forEach(doc => upgradeDelivery(doc, tx));

    // Upgrade movies
    console.log('upgrading movies');
    movies.forEach(doc =>
      upgradeMovie(doc, movieIdsToDeliveryIds[doc.id], movieIdOrgsMapping[doc.id], tx)
    );

    // Upgrade orgs
    console.log('upgrading orgs');
    orgs.forEach(doc => upgradeOrg(doc, tx));

    // Upgrade permissions
    console.log('upgrading permissions');
    orgs.forEach(doc =>
      upgradeOrgPermissions(doc, permissionRef(doc.id), stakeholdersMapping[doc.id] || [], tx)
    );
  });

  return upgradeBis(db);
}
