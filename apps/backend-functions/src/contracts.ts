import { db } from './internals/firebase';
import { Contract, ContractStatus, Mandate, Sale } from '@blockframes/contract/contract/+state/contract.model';
import { Change } from 'firebase-functions';
import { Offer } from '@blockframes/contract/offer/+state';
import { templateIds } from '@blockframes/utils/emails/ids';
import { centralOrgId } from '@env'
import { EmailTemplateRequest } from '@blockframes/utils/emails/utils';
import { getDocument } from '@blockframes/firebase-utils';
import { User } from '@blockframes/auth/+state';
import { App } from '@blockframes/utils/apps';
import { Movie } from '@blockframes/movie/+state';
import { sendMailFromTemplate } from './internals/email';

export async function onContractDelete(contractSnapshot: FirebaseFirestore.DocumentSnapshot<Contract>) {

  const contract = contractSnapshot.data() as Contract;

  // Delete terms belonging to contract
  const termsCollectionRef = db.collection('terms').where('contractId', '==', contract.id);
  const termsSnap = await termsCollectionRef.get();
  for (const term of termsSnap.docs) {
    await term.ref.delete();
  }

  // An offer can have multiple contracts
  // We don't want to delete the offer if it still have other contracts
  // We want to delete the offer only when we delete its last contract
  if (contract.offerId) {
    const offerContractsRef = db.collection('contracts').where('offerId', '==', contract.offerId);
    const offerContractsSnap = await offerContractsRef.get();
    if (offerContractsSnap.empty) {
      await db.doc(`offers/${contract.offerId}`).delete();
    }
  }

  // Delete incomes documents, if any
  const incomesCollectionRef = db.collection('incomes').where('contractId', '==', contract.id);
  const incomesSnap = await incomesCollectionRef.get();
  for (const income of incomesSnap.docs) {
    await income.ref.delete();
  }

  console.log(`Contract ${contract.id} removed`);
}

export async function onContractCreate(contractSnapshot: FirebaseFirestore.DocumentSnapshot<Contract>) {

  const contract = contractSnapshot.data() as Contract;
  if (contract.type !== 'sale') return;
  const stakeholders = contract.stakeholders.filter(
    stakeholder => (stakeholder !== contract.buyerId) && stakeholder !== centralOrgId.catalog
  );
  const app: App = 'catalog';
  const promises = stakeholders.map(async stakeholder => {
    const user = await getDocument<User>(`users/${stakeholder}`)
    const title = await getDocument<Movie>(`movies/${contract.titleId}`)
    const request: EmailTemplateRequest = {
      to: user.email,
      templateId: templateIds.contract.created,
      data: { user, app: { name: app }, title: { names: title.title.international } }
    }
    return sendMailFromTemplate(request, app);
  })

  return Promise.all(promises)

}


export async function onContractUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>
) {

  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const contractBefore = before.data() as Sale | Mandate | undefined;
  const contractAfter = after.data() as Sale | Mandate | undefined;

  // KEEP THE OFFER STATUS IN SYNC WITH IT'S CONTRACTS
  const isSale = contractBefore.type === contractAfter.type && contractBefore.type === 'sale' // contract is of type 'sale'
  const statusHasChanged = contractBefore.status !== contractAfter.status // contract status has changed

  if (isSale && statusHasChanged) {

    const offerRef = db.doc(`offers/${contractAfter.offerId}`);
    const offerSnap = await offerRef.get();
    const offer = offerSnap.data() as Offer;

    if (offer.status === 'signed' || offer.status === 'signing') return

    const offerContractsQuery = db.collection('contracts')
      .where('offerId', '==', contractAfter.offerId)
      .where('type', '==', 'sale');
    const offerContractsSnap = await offerContractsQuery.get();

    const contractsStatus: ContractStatus[] = offerContractsSnap.docs.map(doc => doc.data().status);

    let newOfferStatus = offer.status;
    newOfferStatus = contractsStatus.some(status => status !== 'pending') ? 'negotiating' : newOfferStatus;
    newOfferStatus = contractsStatus.every(status => status === 'accepted') ? 'accepted' : newOfferStatus;
    newOfferStatus = contractsStatus.every(status => status === 'declined') ? 'declined' : newOfferStatus;

    if (newOfferStatus === offer.status) return;
    offerRef.update({ status: newOfferStatus });
  }
}
