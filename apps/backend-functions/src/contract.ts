import { functions, db } from './internals/firebase';
import { ContractDocument, PublicContractDocument, App, NotificationType, OrganizationDocument, PublicOrganization } from './data/types';
import { ValidContractStatuses, ContractStatus, ContractVersionDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { getOrganizationsOfContract, getDocument, versionExists } from './data/internals';
import { triggerNotifications, createNotification } from './notification';
import { centralOrgID } from '@env';
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
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
): Promise<any> {

  const before = change.before.data();
  const after = change.after.data();

  if (!after && !!before) { // Deletion
    return db.doc(`publicContracts/${before.id}`).delete();
  }

  const contract = after as ContractDocument;

  if (!contract) {
    const msg = 'Found invalid contract data.'
    console.error(msg);
    throw new Error(msg);
  }

  return (contract);
}

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
  const contractInNegociation = (previousVersion.status === ContractStatus.submitted) && (after.status === ContractStatus.undernegotiation);
  const contractSubmitted = (previousVersion.status === ContractStatus.draft) && (after.status === ContractStatus.submitted);

  if (contractSubmitted) { // Contract is submitted by organization to Archipel Content

    const { id, name } = await getDocument<PublicOrganization>(`orgs/${contract.partyIds[0]}`); // TODO (#1999): Find real creator

    const archipelContent = await getDocument<OrganizationDocument>(`orgs/${centralOrgID}`);
    const notifications = archipelContent.userIds.map(
      userId => createNotification({
        userId,
        organization: { id, name }, // TODO (#1999): Add the logo to display if orgs collection is not public to Archipel Content
        type: NotificationType.newContract,
        docId: contractId,
        app: App.biggerBoat
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
        type: NotificationType.contractInNegotiation,
        docId: contractId,
        app: App.biggerBoat
      });
    });

    await triggerNotifications(notifications);
  }

  return true;
}
