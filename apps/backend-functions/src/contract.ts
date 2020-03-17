import { functions, db, admin } from './internals/firebase';
import { ContractDocument, PublicContractDocument, OrganizationDocument, PublicOrganization } from './data/types';
import { ValidContractStatuses, ContractVersionDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { getOrganizationsOfContract, getDocument, versionExists } from './data/internals';
import { triggerNotifications, createNotification } from './notification';
import { centralOrgID } from './environments/environment';
import { isEqual } from 'lodash';


async function getCurrentVersionId(tx: FirebaseFirestore.Transaction, contractId: string): Promise<string> {
  return (await _getVersionCount(tx, contractId)).toString(); // @TODO (#1887) change type to number
}

async function getNextVersionId(tx: FirebaseFirestore.Transaction, contractId: string): Promise<string> {
  const count = await _getVersionCount(tx, contractId);
  return (count + 1).toString(); // @TODO (#1887) change type to number
}

async function getCurrentCreationDate(tx: FirebaseFirestore.Transaction, contractId: string): Promise<firebase.firestore.Timestamp | undefined> {
  const versionToFetch = await getCurrentVersionId(tx, contractId);
  const lastVersionSnap = await tx.get(db.doc(`contracts/${contractId}/versions/${versionToFetch}`));
  const doc = lastVersionSnap.data() as ContractVersionDocument;
  return doc.creationDate;
}

/**
 * Get current version count.
 * @TODO (#1887) remove "_meta" filter once migration is ok
 * @param versionSnap 
 */
async function _getVersionCount(tx: FirebaseFirestore.Transaction, contractId: string) {
  const versionSnap = await tx.get(db.collection(`contracts/${contractId}/versions`));
  return versionSnap.docs.filter(d => d.id !== '_meta').length;
}

/**
 * To compare current and previous versions
 * @param contract
 */
function _cleanVersion(contract: ContractDocument) {
  delete contract.lastVersion.id;
  delete contract.lastVersion.creationDate;
  return contract;
}

/**
 *
 * @param contract
 * @param deletedVersionId Used only when a version is removed from DB. We update public data with previous version.
 */
async function transformContractToPublic(contract: ContractDocument, deletedVersionId?: string): Promise<void> {
  return db.runTransaction(async tx => {
    const publicContractSnap = await tx.get(db.doc(`publicContracts/${contract.id}`));

    // Fetching the current version to compare it against deletedVersionId value
    const versionSnap = await tx.get(db.doc(`contracts/${contract.id}/versions/_meta`));
    // @TODO (#1887) using _meta to keep the id of the last version is too dangerous since triggers are not necessary in order.
    const versionDoc = versionSnap.data();
    let lastVersionDoc;
    if (!!versionDoc) {
      // If the current version is the one to skip/delete (deletedVersionId), we take the previous one to check its status
      const versionToFetch = !deletedVersionId || parseInt(deletedVersionId, 10) !== parseInt(versionDoc.count, 10)
        ? versionDoc.count
        // @TODO (#1887) Counting and assuming ids are sequential and ordered is too dangerous.
        // A solution should be to fetch all version ordered by id desc limit 1
        : parseInt(deletedVersionId, 10) - 1;

      const lastVersionSnap = await tx.get(db.doc(`contracts/${contract.id}/versions/${versionToFetch}`));
      lastVersionDoc = lastVersionSnap.data();
    }

    /** @dev public contract document is created only if its status is OK */
    if (lastVersionDoc && ValidContractStatuses.includes(lastVersionDoc.status)) {
      const publicContract: PublicContractDocument = {
        id: contract.id,
        type: contract.type,
        titleIds: contract.titleIds,
      };
      await tx.set(publicContractSnap.ref, publicContract)
    } else {
      /** @dev status is not OK, we delete public contract */
      await tx.delete(db.doc(`publicContracts/${contract.id}`));
    }
  });
}

/**
 * This trigger is in charge of keeping contract and contractVersion document always
 * up to date.
 * 
 * It handles some defined behaviors such as:
 *  - creationDate param
 *  - @TODO (#1887) add more
 * 
 * Concerning the database rules:
 *  - once created, only contract.lastVersion should be allowed for update, other contract fields are forbidden
 *  - once created, a contractVersion document should be read only (even for admins)
 *  - @TODO (#1887) add this requirements into an issue
 * @param change 
 */
export async function onContractWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>
): Promise<any> {
  const before = change.before.data();
  const after = change.after.data();

  /**
   * There is no after but before exits so we are in deletion mode
   * We need to remove publicContract document.
   * Note that this case should never occur since contract deletion (or write) is forbidden.
   */
  if (!after && !!before) {
    // @TODO #1887 also remove subcollections
    return db.doc(`publicContracts/${before.id}`).delete();
  }

  // We retreive current and previous contract documents
  const current = after as ContractDocument;
  const previous = before as ContractDocument;

  if (!!current.lastVersion) {
    return db.runTransaction(async tx => {
      _cleanVersion(current);
      if (!!previous) { // We have a previous version to compare against.
        if (!previous.lastVersion) {
          // Old way compatibility. If a new version is pushed but previous does not have lastVersion attribute,
          // we fetch it.
          const versionDoc = await getCurrentVersionId(tx, current.id);
          if (versionDoc !== '0') {
            const lastVersionSnap = await tx.get(db.doc(`contracts/${previous.id}/versions/${versionDoc}`));
            previous.lastVersion = lastVersionSnap.data() as any;
          }
        }
        if (!!previous.lastVersion) { _cleanVersion(previous) };
      }

      if (!previous || !isEqual(current.lastVersion, previous.lastVersion)) {
        current.lastVersion.id = await getNextVersionId(tx, current.id);
        // Creation date is handled here. No need to push it, it will be overrided here.
        current.lastVersion.creationDate = admin.firestore.Timestamp.now();
        const versionToHistorize = current.lastVersion as ContractVersionDocument;
        // We historize current version 
        tx.set(db.doc(`contracts/${current.id}/versions/${versionToHistorize.id}`), versionToHistorize);
        // We update _meta document for backward compatibility
        tx.set(db.doc(`contracts/${current.id}/versions/_meta`), { count: parseInt(versionToHistorize.id, 10) }, { merge: true });
        // Update contract
        tx.set(change.after.ref, { lastVersion: current.lastVersion }, { merge: true });
      } else if (!!previous && !!previous.lastVersion && isEqual(current.lastVersion, previous.lastVersion)) {
        // To prevent the case when the front try to push version Id or creationDate (which are only handled by this trigger).
        current.lastVersion.id = await getCurrentVersionId(tx, current.id);
        current.lastVersion.creationDate = await getCurrentCreationDate(tx, current.id);
        tx.set(change.after.ref, { lastVersion: current.lastVersion }, { merge: true });
      }
      return current;
    });
  } else {
    // Contract have been pushed the old way (lastVersion is pushed separatly)
    // nothing to do, let onContractVersionWrite handle the case (temporarly)
    return false;
  }
}

// @TODO #1887 remove this but keep public contract creation logic & notifications
export async function onContractVersionWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const { contractId, versionId } = context.params;

  if (!contractId) {
    const msg = 'Found invalid contractVersion data on deletion.'
    console.error(msg);
    throw new Error(msg);
  }

  const before = change.before.data() as ContractVersionDocument;
  const after = change.after.data() as ContractVersionDocument;
  const contract = await getDocument<ContractDocument>(`contracts/${contractId}`);

  // @TODO ICI if contract.lastVersion does not exists

  if (!after && !!before) { // Deletion
    console.log(`deleting ContractVersion : "${versionId}" for : ${contractId}`);
    return transformContractToPublic(contract, versionId);
  }

  // Prepare data to create notifications
  const previousVersionId = (parseInt(after.id, 10) - 1).toString(); // @TODO (#1887)

  if (!versionExists(contractId, previousVersionId)) {
    const msg = 'Contract does not have a previous version';
    console.error(msg);
    throw new Error(msg);
  }

  await transformContractToPublic(contract);

  const previousVersion = await getDocument<ContractVersionDocument>(`contracts/${contractId}/versions/${previousVersionId}`)
  const contractInNegociation = (previousVersion.status === 'submitted') && (after.status === 'undernegotiation');
  const contractSubmitted = (previousVersion.status === 'draft') && (after.status === 'submitted');

  if (contractSubmitted) { // Contract is submitted by organization to Archipel Content

    const { id, name } = await getDocument<PublicOrganization>(`orgs/${contract.partyIds[0]}`); // TODO (#1999): Find real creator

    const archipelContent = await getDocument<OrganizationDocument>(`orgs/${centralOrgID}`);
    const notifications = archipelContent.userIds.map(
      userId => createNotification({
        userId,
        organization: { id, name }, // TODO (#1999): Add the logo to display if orgs collection is not public to Archipel Content
        type: 'newContract',
        docId: contractId,
        app: 'biggerBoat'
      })
    );

    await triggerNotifications(notifications);
  }

  if (contractInNegociation) { // Contract is validated by Archipel Content

    const organizations = await getOrganizationsOfContract(contract);

    const notifications = organizations
      .filter(organizationDocument => !!organizationDocument && !!organizationDocument.userIds)
      .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
      .map(userId => {
        return createNotification({
          userId,
          type: 'contractInNegotiation',
          docId: contractId,
          app: 'biggerBoat'
        });
      });

    await triggerNotifications(notifications);
  }

  return true;
}
