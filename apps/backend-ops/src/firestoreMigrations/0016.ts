import { Firestore } from '../admin';


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
        batch.update(rightRef, {terms: newTerms});
      });

      // And delete the old Distribution Deals
      distributionDeals.forEach(deal => {
        batch.delete(deal.ref);
      })
    };
  });
  console.log('Creation of subcollection Distribution Rights and deletion of distribution deals ok');

  await Promise.all(updates);
  return batch.commit();
}
