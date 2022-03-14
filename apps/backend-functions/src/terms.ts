import { db } from './internals/firebase';
import { Bucket, Term } from '@blockframes/model';

export async function onTermDelete(termSnapshot: FirebaseFirestore.DocumentSnapshot<Term>) {

  const term = termSnapshot.data() as Term;
  await db.runTransaction(async tx => {

    const contractsCollectionRef = db.collection('contracts').where('parentTermId', '==', term.id);
    const contractsSnap = await tx.get(contractsCollectionRef);

    const bucketsCollectionRef = db.collection('buckets');
    const bucketsSnap = await tx.get(bucketsCollectionRef);
    
    const incomesCollectionRef = db.collection('incomes').where('termId', '==', term.id);
    const incomesSnap = await tx.get(incomesCollectionRef);

    // Delete contracts that have this term as parent
    for (const contract of contractsSnap.docs) {
      await tx.delete(contract.ref);
    }

    // Update Buckets documents
    for (const doc of bucketsSnap.docs) {
      const bucket = doc.data() as Bucket;
      if (bucket.contracts.some(c => c.parentTermId === term.id)) {
        bucket.contracts = bucket.contracts.filter(c => c.parentTermId !== term.id);
        await tx.update(doc.ref, bucket);
      }
    }

    // Delete incomes documents, if any
    for (const income of incomesSnap.docs) {
      await tx.delete(income.ref);
    }

  });

  console.log(`Term ${term.id} removed`);
}
