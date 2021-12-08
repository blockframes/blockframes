import { db } from './internals/firebase';
import { Change, EventContext } from 'firebase-functions';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';


export async function onNegotiationUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>, context: EventContext
) {

  const { contractId } = context.params
  const before = change.before?.data() as Negotiation;
  const after = change.after?.data() as Negotiation;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const hasStatusChanged = before.status !== after.status

  if (!hasStatusChanged) return;

  const { status, declineReason = "" } = after;

  const updates = status === 'declined' ? { declineReason, status } : { status };

  db.doc(`contracts/${contractId}`).update(updates);
}
