import { functions, db } from './internals/firebase';
import { ContractDocument, PublicContractDocument, OrganizationDocument, PublicOrganization } from './data/types';
import { ValidContractStatuses, ContractVersionDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { getOrganizationsOfContract, getDocument, versionExists } from './data/internals';
import { triggerNotifications, createNotification } from './notification';
import { centralOrgID } from './environments/environment';
import { isEqual } from 'lodash';


async function getCurrentVersionId(contractId: string): Promise<string> {
  const versionSnap = await db.collection(`contracts/${contractId}/versions`).get();
  return versionSnap.size.toString();
}

async function getNextVersionId(contractId: string): Promise<string> {
  const versionSnap = await db.collection(`contracts/${contractId}/versions`).get();
  return (versionSnap.size + 1).toString();
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


export async function onContractWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>
): Promise<any> {
  const before = change.before.data();
  const after = change.after.data();

  /**
   * There is no after but before exits
   * so we are in deletion mode
   * We need to remove publicContract document
   */
  if (!after && !!before) {
    // @TODO #1887 also remove subcollections ?
    return db.doc(`publicContracts/${before.id}`).delete();
  }

  // We retreive current and previous contract documents
  const current = after as ContractDocument;
  const previous = before as ContractDocument;

  const currentVersionId = current.lastVersion && current.lastVersion.id ? current.lastVersion.id : '1';
  delete current.lastVersion.id;
  let previousVersionId = '1';
  if (previous && previous.lastVersion) {
    previousVersionId = previous.lastVersion.id;
    delete previous.lastVersion.id;
  }//@TODO #1887 else => aller recup la version en sous collection (old way)

  //@todo interdire l'update d'un contrat mais pas contract.lastVersion dans les rules?
  // @todo gérer la création date

  // todo ajouter un if !current.lastVersion (old way)

  if (!previous || !isEqual(current.lastVersion, previous.lastVersion)) {
    console.log('ici');
    // We historize current version 
    current.lastVersion.id = await getNextVersionId(current.id);
    const versionToHistorize = current.lastVersion as ContractVersionDocument;
    // @TODO #1887 transaction
    db.doc(`contracts/${current.id}/versions/${versionToHistorize.id}`).set(versionToHistorize);
    change.after.ref.set({ lastVersion: current.lastVersion }, { merge: true });
  } else if (!!previous) {
    console.log('la');
    if (isEqual(current.lastVersion, previous.lastVersion)) {
      console.log('lala');
      // To prevent the case when the front try to push version Id (which is only handled by this trigger).
      if (currentVersionId !== previousVersionId) {
        console.log('lalala');
        current.lastVersion.id = await getCurrentVersionId(current.id);
        change.after.ref.set({ lastVersion: current.lastVersion }, { merge: true });
      }
    }

  }

  return current;
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
