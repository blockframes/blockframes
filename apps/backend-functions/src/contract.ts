import { functions, db } from './internals/firebase';
import { ContractDocument, PublicContractDocument, OrganizationDocument, PublicOrganization } from './data/types';
import { ValidContractStatuses, ContractVersionDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { getOrganizationsOfContract, getDocument } from './data/internals';
import { triggerNotifications, createNotification } from './notification';
import { centralOrgID } from './environments/environment';
import { isEqual } from 'lodash';
import { firestore } from 'firebase-admin';

async function getCurrentVersionId(tx: FirebaseFirestore.Transaction, contractId: string): Promise<string> {
  return (await _getVersionCount(contractId, tx)).toString(); // @TODO (#1887) change type to number
}

async function getNextVersionId(tx: FirebaseFirestore.Transaction, contractId: string): Promise<string> {
  const count = await _getVersionCount(contractId, tx);
  return (count + 1).toString(); // @TODO (#1887) change type to number
}

async function getPreviousVersionId(contractId: string): Promise<string> {
  const count = await _getVersionCount(contractId);
  return (count > 1 ? count - 1 : 1).toString(); // @TODO (#1887) change type to number
}

async function getCurrentCreationDate(tx: FirebaseFirestore.Transaction, contractId: string): Promise<firebase.firestore.Timestamp | undefined> {
  const versionToFetch = await getCurrentVersionId(tx, contractId);
  const lastVersionSnap = await tx.get(db.doc(`contracts/${contractId}/versions/${versionToFetch}`));
  const doc = lastVersionSnap.data() as ContractVersionDocument;
  return doc.creationDate;
}

/**
 * Get current version count.
 * @TODO (#1887) remove "_meta" filter once code migration is ok
 * @param versionSnap 
 */
async function _getVersionCount(contractId: string, tx?: FirebaseFirestore.Transaction) {
  if (tx) {
    const versionSnap = await tx.get(db.collection(`contracts/${contractId}/versions`));
    return versionSnap.docs.filter(d => d.id !== '_meta').length;
  } else {
    const versionSnap = await db.collection(`contracts/${contractId}/versions`).get();
    return versionSnap.docs.filter(d => d.id !== '_meta').length;
  }
}

/**
 * This method is in charge of creating public contract document.
 * @dev public contract document is created only if its status is OK
 * @param tx
 * @param contract
 */
async function updatePublicContract(tx: FirebaseFirestore.Transaction, contract: ContractDocument): Promise<void> {
  if (!!contract.lastVersion && ValidContractStatuses.includes(contract.lastVersion.status)) {
    const publicContractSnap = await tx.get(db.doc(`publicContracts/${contract.id}`));
    const publicContract: PublicContractDocument = {
      id: contract.id,
      type: contract.type,
      titleIds: contract.titleIds,
    };
    tx.set(publicContractSnap.ref, publicContract)
  } else {
    /** @dev status is not OK, we delete public contract */
    tx.delete(db.doc(`publicContracts/${contract.id}`));
  }
}

/**
 * Checks for a status change between previous and current and triggers notifications.
 * @param current
 * @param previous 
 */
async function checkAndTriggerNotifications(current: ContractDocument) {
  const previousVersionId = await getPreviousVersionId(current.id);
  const previousVersionSnap = await db.doc(`contracts/${current.id}/versions/${previousVersionId}`).get();
  const previous = previousVersionSnap.data() as ContractVersionDocument;

  if (!!previous) {
    const contractInNegociation = (previous.status === 'submitted') && (current.lastVersion.status === 'undernegotiation');
    const contractSubmitted = (previous.status === 'draft') && (current.lastVersion.status === 'submitted');

    if (contractSubmitted) { // Contract is submitted by organization to Archipel Content
      // @TODO (#1887) crashes if partyIds is empty
      // TODO (#1999): Find real creator 
      const { id, name } = await getDocument<PublicOrganization>(`orgs/${current.partyIds[0]}`);
      const archipelContent = await getDocument<OrganizationDocument>(`orgs/${centralOrgID}`);
      const notifications = archipelContent.userIds.map(
        userId => createNotification({
          userId,
          organization: { id, name }, // TODO (#1999): Add the logo to display if orgs collection is not public to Archipel Content
          type: 'newContract',
          docId: current.id,
          app: 'biggerBoat'
        })
      );

      await triggerNotifications(notifications);
    }

    if (contractInNegociation) { // Contract is validated by Archipel Content
      const organizations = await getOrganizationsOfContract(current);
      const notifications = organizations
        .filter(organizationDocument => !!organizationDocument && !!organizationDocument.userIds)
        .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
        .map(userId => {
          return createNotification({
            userId,
            type: 'contractInNegotiation',
            docId: current.id,
            app: 'biggerBoat'
          });
        });

      await triggerNotifications(notifications);
    }
  }
}


/**
 * This trigger is in charge of keeping contract and contractVersion document always
 * up to date.
 * 
 * It handles some defined behaviors such as:
 *  - creationDate param
 *  - versionId consistency
 *  - @TODO (#1887) add more
 * 
 * Concerning the database rules:
 *  - once created, a contractVersion document should be read only and not removable (even for admins)
 *  - once code migration complete, contratVersion should be writable by this function only (even for admins)
 *  - once code migration complete, contract.lastVersion MUST be sent when performing write operations.
 *  - @TODO (#1887) add this requirements into an issue
 * @param change 
 */
export async function onContractWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
): Promise<any> {
  const before = change.before.data();
  const after = change.after.data();

  /**
   * There is no after but before exits so we are in deletion mode
   * We need to remove publicContract document.
   * Note that this case should never occur since contract deletion (or write) is forbidden.
   */
  if (!after && !!before) {
    await db.doc(`publicContracts/${before.id}`).delete();
  }

  // We retreive current contract document
  const current = after as ContractDocument;

  if (!!current.lastVersion && current.lastVersion.status !== 'draft') {
    await db.runTransaction(async tx => {

      let lastVersion;
      const lastVersionId = await getCurrentVersionId(tx, current.id);
      if (lastVersionId !== '0') {
        const lastVersionSnap = await tx.get(db.doc(`contracts/${current.id}/versions/${lastVersionId}`));
        lastVersion = lastVersionSnap.data() as any;
      }

      if (!!lastVersion) {
        if (lastVersion.id && current.lastVersion.id && parseInt(lastVersion.id, 10) > parseInt(current.lastVersion.id, 10)) {
          console.log(`Version id "${current.lastVersion.id}" must be higher than previous one "${lastVersion.id}".`);
          tx.set(change.after.ref, { lastVersion: lastVersion }, { merge: true });
          return false;
        }
        // To compare current and previous versions against each other
        delete lastVersion.id;
        delete lastVersion.creationDate;
      };

      // To compare current and previous versions against each other
      delete current.lastVersion.id;
      const currentCreationDate = current.lastVersion.creationDate ? current.lastVersion.creationDate : firestore.Timestamp.now();
      delete current.lastVersion.creationDate;
      if (!lastVersion || !isEqual(current.lastVersion, lastVersion)) {
        current.lastVersion.id = await getNextVersionId(tx, current.id);
        // Creation date is handled here. If not sent by user, it is created here.
        current.lastVersion.creationDate = currentCreationDate as any;
        const versionToHistorize = current.lastVersion as ContractVersionDocument;
        // A new version have been saved, we check if public contract need to be updated
        await updatePublicContract(tx, current);
        // We historize current version 
        tx.set(db.doc(`contracts/${current.id}/versions/${versionToHistorize.id}`), versionToHistorize);
        // We update _meta document for backward compatibility
        tx.set(db.doc(`contracts/${current.id}/versions/_meta`), { count: parseInt(versionToHistorize.id, 10) }, { merge: true });
        // Update contract
        tx.set(change.after.ref, { lastVersion: current.lastVersion }, { merge: true });
      } else {
        // To prevent the case where the front tries to push version Id or creationDate (which are only handled by this trigger).
        current.lastVersion.id = await getCurrentVersionId(tx, current.id);
        current.lastVersion.creationDate = await getCurrentCreationDate(tx, current.id);
        // A new version have been saved, we check if public contract need to be updated
        // @TODO (#1887) remove next line once code migration is OK
        await updatePublicContract(tx, current);
        tx.set(change.after.ref, { lastVersion: current.lastVersion }, { merge: true });
      }
      return current;
    });
    // Contract version may have changed, we check if notifications need to be triggered
    // @TODO (#1887) uncomment next line once code migration is OK
    // await checkAndTriggerNotifications(current);
    return true;
  } else {
    // Contract have been pushed the old way (lastVersion is pushed separatly)
    // nothing to do, let onContractVersionWrite handle the case (temporarly)
    // Also, rules should have prevent this case (@see method definition).
    return false;
  }
}

/**
 * This is for the old way, when version was pushed separatly from contract
 * This trigger handles this old way to keep database up to date
 * @param change 
 * @param context
 * @TODO (#1887) remove this when code migration is ok to prevent useless writes
 */
export async function onContractVersionWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const { contractId, versionId } = context.params;
  const after = change.after.data();

  if (!after) {
    console.log(`Contract version "${versionId}" have been deleted.`);
    return;
  }

  await db.runTransaction(async tx => {
    if (versionId === '_meta') {
      // Force count so data is always OK even if user push a bad version count.
      after.count = await getCurrentVersionId(tx, contractId);
      tx.set(db.doc(`contracts/${contractId}/versions/_meta`), { count: parseInt(after.count, 10) }, { merge: true });
    } else {
      // We just update contract.lastVersion with this data,
      // and let the onContractWrite function handle the job.
      const contractSnap = await tx.get(db.doc(`contracts/${contractId}`));
      tx.set(contractSnap.ref, { lastVersion: after }, { merge: true });
      if (!!after.status && after.status === 'draft') {
        // To avoid polluting DB.
        tx.delete(change.after.ref);
      }
    }
    return true;
  });
  if (versionId !== '_meta') {
    const contractSnapshot = await db.doc(`contracts/${contractId}`).get();
    const contractDoc = contractSnapshot.data() as ContractDocument;
    // Contract version may have changed, we check if notifications need to be triggered
    await checkAndTriggerNotifications(contractDoc);
  }
  return true;
}
