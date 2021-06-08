import { db } from './internals/firebase';
import { Term } from '@blockframes/contract/term/+state';
import { Bucket } from '@blockframes/contract/bucket/+state';

export async function onTermDelete(termSnapshot: FirebaseFirestore.DocumentSnapshot<Term>) {

  const term = termSnapshot.data() as Term;

  // Delete contracts that have this term as parent
  const contractsCollectionRef = db.collection('contracts').where('parentTermId', '==', term.id);
  const contractsSnap = await contractsCollectionRef.get();
  for (const contract of contractsSnap.docs) {
    await contract.ref.delete();
  }


  // Update Buckets documents
  const bucketsCollectionRef = await db.collection('buckets').get();
  for (const doc of bucketsCollectionRef.docs) {
    const bucket = doc.data() as Bucket;

    if (bucket.contracts.some(c => c.parentTermId === term.id)) {
      bucket.contracts = bucket.contracts.filter(c => c.parentTermId !== term.id);
      doc.ref.update(bucket);
    }
  }

  console.log(`Term ${term.id} removed`);
}
