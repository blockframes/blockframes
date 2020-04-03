import { Firestore } from '../admin';
import { promises } from 'dns';


/**
 * Update the distributionDeals subcollection (rename in distributionRights)
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  const updates = movies.docs.map(async movie => {
    const distributionDeals = await movie.ref.collection('distributionDeals').get();

    if (distributionDeals) {
      // Create new sub collection named Distribution Rights
      distributionDeals.forEach(right => {
        movie.ref.collection('distributionRights').add({...right});
        // const rightRef = movie.ref.collection('distributionRights').doc(right.id);
        // const newRight = JSON.parse(JSON.stringify(right));
        // batch.set(rightRef, newRight);
      });

      // And delete the old Distribution Deals
      // ! That works !
      // distributionDeals.forEach(deal => {
      //   batch.delete(deal.ref);
      // })
    };
  });
  console.log('Creation of subcollection Distribution Rights and deletion of distribution deals ok');

  await Promise.all(updates);
  return batch.commit();
}

// Test

// ! WTF is this newRights._serializer ???
// const newRights = {...right};
// batch.set(rightRef, {newRights} || {...right});
// Error: Value for argument "data" is not a valid Firestore document. Couldn't serialize
// object of type "Serializer" (found in field "newRights._serializer").
// Firestore doesn't support JavaScript objects with custom prototypes (i.e. objects that were created via the "new" operator).

// movie.ref.collection('distributionRights').add({...right});
// Error: Value for argument "data" is not a valid Firestore document. Couldn't serialize object of type "Serializer" (found in field "_serializer").
// Firestore doesn't support JavaScript objects with custom prototypes (i.e. objects that were created via the "new" operator).

// batch.set(rightRef, right);
// Error: Value for argument "data" is not a valid Firestore document. Couldn't serialize object of type "QueryDocumentSnapshot".
// Firestore doesn't support JavaScript objects with custom prototypes (i.e. objects that were created via the "new" operator).

// batch.set(rightRef, JSON.parse(JSON.stringify(right)));
// fonctionne mais me donne un truc chelou en BDD
