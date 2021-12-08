import { db } from './internals/firebase';
import { Sale } from '@blockframes/contract/contract/+state/contract.model';
import { Change, EventContext } from 'firebase-functions';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';


export async function onNegotiationUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>, context: EventContext
) {

  const before = change.before;
  const after = change.after;
  const { contractId } = context.params

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const negotiationBefore = before.data() as Negotiation;
  const negotiationAfter = after.data() as Negotiation;

  const isStatusUnchanged = negotiationBefore.status === negotiationAfter.status
  const isDeclined = negotiationAfter.status === 'declined'

  if (isStatusUnchanged) return;

  const saleRef = db.doc(`contracts/${contractId}`);
  const saleSnap = await saleRef.get();
  const sale = saleSnap.data() as Sale<Date>;

  if (sale.status !== 'pending' && sale.status !== 'negotiating') return

  const updates: Partial<Negotiation> = { status: negotiationAfter.status };
  if (isDeclined)
    updates.declineReason = negotiationAfter.declineReason;

  saleRef.update(updates);
}
