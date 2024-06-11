import { CallableContext } from 'firebase-functions/v1/https';
import {
  Expense,
  Income,
  Movie,
  Organization,
  Right,
  Statement,
  User,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  WaterfallPermissions,
  convertDocumentTo,
  createInternalDocumentMeta,
  createNotification,
  createPublicUser,
  getDefaultVersionId,
  isContract,
  isDirectSalesStatement,
  isDistributorStatement,
  isStandaloneVersion,
  Notification,
  isProducerStatement
} from '@blockframes/model';
import { getDocument, getCollection, getDocumentSnap, queryDocuments } from '@blockframes/firebase-utils/firebase-utils';
import { BlockframesChange, BlockframesSnapshot, removeAllSubcollections } from '@blockframes/firebase-utils';
import { difference } from 'lodash';
import { cleanRelatedContractDocuments } from './contracts';
import { db } from './internals/firebase';
import { EventContext } from 'firebase-functions';
import { cleanWaterfallMedias } from './media';
import { userRequestedDocumentCertification, userRequestedStatementReview } from './templates/mail';
import { getMailSender } from '@blockframes/utils/apps';
import { triggerNotifications } from './notification';
import { groupIds } from '@blockframes/utils/emails/ids';
import { sendMail } from './internals/email';

export async function onWaterfallUpdate(change: BlockframesChange<Waterfall>) {
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after) {
    console.error('Invalid waterfall data, before:', before, 'after:', after);
    throw new Error('waterfall update function got invalid data');
  }

  cleanWaterfallMedias(before, after);

  const promises = [];

  // If org is removed from waterfall document
  if (before.orgIds.length > after.orgIds.length) {
    const orgRemovedIds = difference(before.orgIds, after.orgIds);
    for (const orgRemovedId of orgRemovedIds) {
      // remove permissions
      promises.push(getDocumentSnap(`waterfall/${after.id}/permissions/${orgRemovedId}`).then(p => p.ref.delete()));

      // remove invitations
      promises.push(db.collection('invitations')
        .where('waterfallId', '==', after.id)
        .where('toUser.orgId', '==', orgRemovedId).get()
        .then(d => d.docs.forEach(doc => doc.ref.delete())));
    }
  }

  // If rightholder is removed from waterfall document, we also update permissions
  if (before.rightholders.length > after.rightholders.length) {
    const rightholderRemovedIds = difference(before.rightholders.map(r => r.id), after.rightholders.map(r => r.id));
    const _permissions = await getCollection<WaterfallPermissions>(`waterfall/${after.id}/permissions`);
    const permissions = after.orgIds.map(o => _permissions.find(p => p.id === o));
    for (const permission of permissions) {
      if (permission.rightholderIds.some(id => rightholderRemovedIds.includes(id))) {
        permission.rightholderIds = permission.rightholderIds.filter(id => !rightholderRemovedIds.includes(id));
        promises.push(getDocumentSnap(`waterfall/${after.id}/permissions/${permission.id}`).then(p => p.ref.update({ rightholderIds: permission.rightholderIds })));
      }
    }
  }


  // Deletes removed blocks from versions
  const blocksBefore = before.versions ? Array.from(new Set(before.versions.map(v => v.blockIds).flat())) : [];
  const blocksAfter = after.versions ? Array.from(new Set(after.versions.map(v => v.blockIds).flat())) : [];
  const removedBlocks = blocksBefore.filter(b => !blocksAfter.includes(b));
  for (const blockId of removedBlocks) {
    promises.push(getDocumentSnap(`waterfall/${after.id}/blocks/${blockId}`).then(b => b.ref.delete()));
  }
  return Promise.all(promises);
}

export async function onWaterfallDelete(snap: BlockframesSnapshot<Waterfall>, context: EventContext) {
  const { waterfallID } = context.params;
  const batch = db.batch();

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);

  const waterfall = snap.data();
  cleanWaterfallMedias(waterfall);

  // Remove remaining standalone incomes and expenses (not linked to contracts)
  const [incomes, expenses] = await Promise.all([
    db.collection('incomes').where('titleId', '==', waterfallID).get(),
    db.collection('expenses').where('titleId', '==', waterfallID).get()
  ]);
  incomes.forEach(doc => batch.delete(doc.ref));
  expenses.forEach(doc => batch.delete(doc.ref));

  // remove invitations
  const invitations = await db.collection('invitations').where('waterfallId', '==', waterfallID).get();
  invitations.forEach(doc => batch.delete(doc.ref));

  return batch.commit();
}

export async function onWaterfallDocumentDelete(docSnapshot: BlockframesSnapshot<WaterfallDocument>, context: EventContext) {
  const { waterfallID } = context.params;

  const waterfallDocument = docSnapshot.data();
  const waterfallSnap = await getDocumentSnap(`waterfall/${waterfallID}`);
  if (waterfallSnap.exists) {
    const waterfall = waterfallSnap.data() as Waterfall;
    const documents = waterfall.documents.filter(d => d.id !== waterfallDocument.id);
    delete waterfall.expenseTypes[waterfallDocument.id];
    // This will trigger onWaterfallUpdate => cleanWaterfallMedias
    waterfallSnap.ref.update({ documents, expenseTypes: waterfall.expenseTypes });
  }

  // If document is a contract, clean income, terms, statements, rights etc..
  if (isContract(waterfallDocument)) {
    await cleanRelatedContractDocuments(convertDocumentTo<WaterfallContract>(waterfallDocument), { filterByTitleId: true });

    const statements = await waterfallSnap.ref.collection('statements').where('contractId', '==', waterfallDocument.id).get();
    await Promise.all(statements.docs.map(d => d.ref.delete()));

    const rights = await waterfallSnap.ref.collection('rights').where('contractId', '==', waterfallDocument.id).get();
    await Promise.all(rights.docs.map(d => d.ref.delete()));
  }

  // Check for amendments and remove them if any
  if (!waterfallDocument.rootId) {
    const amendments = await waterfallSnap.ref.collection('documents').where('rootId', '==', waterfallDocument.id).get();
    await Promise.all(amendments.docs.map(d => d.ref.delete()));
  }

  return true;
}

export async function onWaterfallDocumentUpdate(change: BlockframesChange<WaterfallDocument>) {
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after) {
    console.error('Invalid document data, before:', before, 'after:', after);
    throw new Error('Document update function got invalid data');
  }

  const orgAddedIds = difference(after.sharedWith || [], before.sharedWith || []);
  const organizations = await Promise.all(orgAddedIds.map(o => getDocument<Organization>(`orgs/${o}`)));
  const userIds = Array.from(new Set(organizations.map(o => o.userIds).flat()));

  const notifications = userIds.map(toUserId => createNotification({
    toUserId,
    docId: after.waterfallId,
    documentId: after.id,
    _meta: createInternalDocumentMeta({ createdFrom: 'waterfall' }),
    type: 'documentSharedWithOrg'
  }));

  await triggerNotifications(notifications);
  return true;
}

export async function onWaterfallStatementUpdate(change: BlockframesChange<Statement>, context: EventContext) {
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after) {
    console.error('Invalid statement data, before:', before, 'after:', after);
    throw new Error('Statement update function got invalid data');
  }

  const batch = db.batch();

  if (isDistributorStatement(after) || isDirectSalesStatement(after)) {
    const { waterfallID } = context.params;

    const waterfallSnap = await getDocumentSnap(`waterfall/${waterfallID}`);
    if (waterfallSnap.exists) {
      const waterfall = waterfallSnap.data() as Waterfall;

      // If incomeId is removed from distributor or direct sales statement document, we also remove or update income document
      const incomeRemovedIds = difference(before.incomeIds, after.incomeIds);
      const incomes = await Promise.all(incomeRemovedIds.map(id => getDocumentSnap(`incomes/${id}`, db)));

      // Same for expenses
      const expenseRemovedIds = difference(before.expenseIds, after.expenseIds);
      const expenses = await Promise.all(expenseRemovedIds.map(id => getDocumentSnap(`expenses/${id}`, db)));

      const defaultVersionId = getDefaultVersionId(waterfall);
      const isStandalone = isStandaloneVersion(waterfall, after.versionId);
      if (!isStandalone && after.versionId && defaultVersionId && after.versionId !== defaultVersionId) {
        incomes.forEach(doc => {
          const i = doc.data() as Income;
          delete i.version[after.versionId];
          batch.update(doc.ref, { version: i.version });
        });

        expenses.forEach(doc => {
          const e = doc.data() as Expense;
          delete e.version[after.versionId];
          batch.update(doc.ref, { version: e.version });
        });
      } else {
        incomes.forEach(doc => batch.delete(doc.ref));
        expenses.forEach(doc => batch.delete(doc.ref));
      }
    }
  }

  // Check if blockchain certification has be requested
  if (after.status === 'reported' && !before.hash?.requested && after.hash?.requested === true) {
    const userDocument = await getDocument<User>(`users/${after.hash.requestedBy}`);
    const user = createPublicUser(userDocument);
    const movie = await getDocument<Movie>(`movies/${after.waterfallId}`);
    const organization = await getDocument<Organization>(`orgs/${user.orgId}`);
    const mailRequest = userRequestedDocumentCertification(user, organization, 'statement', after.id, movie);
    const from = getMailSender('waterfall');

    const notification = createNotification({
      toUserId: user.uid,
      docId: after.waterfallId,
      statementId: after.id,
      _meta: createInternalDocumentMeta({ createdFrom: 'waterfall' }),
      type: 'userRequestedDocumentCertification'
    });

    await triggerNotifications([notification]);
    await sendMail(mailRequest, from, groupIds.noUnsubscribeLink).catch(e => console.warn(e.message));
  }

  // Send notifications when a statement was reviewed and is accepted or declined
  if (before.reviewStatus === 'pending' && ['accepted', 'declined'].includes(after.reviewStatus) && after._meta?.createdBy) {
    const userDocument = await getDocument<User>(`users/${after._meta.createdBy}`);
    if (userDocument) {
      const user = createPublicUser(userDocument);
      if (after.reviewStatus === 'accepted') {
        const notification = createNotification({
          toUserId: user.uid,
          docId: after.waterfallId,
          statementId: after.id,
          _meta: createInternalDocumentMeta({ createdFrom: 'waterfall' }),
          type: 'requestForStatementReviewApproved'
        });
        await triggerNotifications([notification]);
      } else if (after.reviewStatus === 'declined') {
        const notification = createNotification({
          toUserId: user.uid,
          docId: after.waterfallId,
          statementId: after.id,
          _meta: createInternalDocumentMeta({ createdFrom: 'waterfall' }),
          type: 'requestForStatementReviewDeclined'
        });
        await triggerNotifications([notification]);
      }
    }
  }

  return batch.commit();
}

export async function onWaterfallStatementDelete(docSnapshot: BlockframesSnapshot<Statement>, context: EventContext) {
  const statement = docSnapshot.data();

  const batch = db.batch();

  if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
    const { waterfallID } = context.params;

    const waterfallSnap = await getDocumentSnap(`waterfall/${waterfallID}`);
    if (waterfallSnap.exists) {
      const waterfall = waterfallSnap.data() as Waterfall;

      // Remove or update incomes and expenses 
      const incomes = await Promise.all(statement.incomeIds.map(id => getDocumentSnap(`incomes/${id}`, db)));
      const expenses = await Promise.all(statement.expenseIds.map(id => getDocumentSnap(`expenses/${id}`, db)));

      // Remove related (producer/outgoing or duplicated from) statements
      const statements = await waterfallSnap.ref.collection('statements').get();
      const statementsToDelete = statements.docs.filter(s => {
        const stm = s.data() as Statement;
        return stm.incomeIds.some(id => statement.incomeIds.includes(id)) && (isProducerStatement(stm) || stm.duplicatedFrom === statement.id);
      });
      await Promise.all(statementsToDelete.map(d => d.ref.delete()));

      const defaultVersionId = getDefaultVersionId(waterfall);
      const isStandalone = isStandaloneVersion(waterfall, statement.versionId);
      if (!isStandalone && statement.versionId && defaultVersionId && statement.versionId !== defaultVersionId) {
        incomes.forEach(doc => {
          const i = doc.data() as Income;
          delete i.version[statement.versionId];
          batch.update(doc.ref, { version: i.version });
        });

        expenses.forEach(doc => {
          const e = doc.data() as Expense;
          delete e.version[statement.versionId];
          batch.update(doc.ref, { version: e.version });
        });
      } else {
        incomes.forEach(doc => batch.delete(doc.ref));
        expenses.forEach(doc => batch.delete(doc.ref));
      }
    }
  }

  return batch.commit();
}

export async function onWaterfallRightDelete(docSnapshot: BlockframesSnapshot<Right>, context: EventContext) {
  const { waterfallID } = context.params;

  const right = docSnapshot.data();

  const waterfallSnap = await getDocumentSnap(`waterfall/${waterfallID}`);

  const rightsSnap = await waterfallSnap.ref.collection('rights').get();

  // Remove members if current right is a group
  const members = rightsSnap.docs.filter(r => (r.data() as Right).groupId === right.id);
  await Promise.all(members.map(d => d.ref.delete()));

  // Update parents referencing this right
  const parents = rightsSnap.docs.filter(r => (r.data() as Right).nextIds.includes(right.id));
  await Promise.all(parents.map(d => d.ref.update({ nextIds: (d.data() as Right).nextIds.filter(id => id !== right.id) })));
  return true;
}

export const removeWaterfallFile = async (data: { waterfallId: string, documentId: string }, context: CallableContext) => {
  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  const user = await getDocument<User>(`users/${context.auth.uid}`);
  if (!user.orgId) throw new Error('Permission denied: missing org id.');
  const waterfallSnap = await getDocumentSnap(`waterfall/${data.waterfallId}`);
  if (!waterfallSnap.exists) throw new Error('Permission denied: waterfall not found.');
  const waterfall = waterfallSnap.data() as Waterfall;
  if (!waterfall.orgIds.includes(user.orgId)) throw new Error('Permission denied: user is not part of the waterfall.');
  const permission = await getDocument<WaterfallPermissions>(`waterfall/${data.waterfallId}/permissions/${user.orgId}`);
  const document = await getDocument<WaterfallDocument>(`waterfall/${data.waterfallId}/documents/${data.documentId}`);

  const canRemoveFile = permission.isAdmin || document.ownerId === user.orgId;
  if (!canRemoveFile) throw new Error('Permission denied: user is not waterfall admin or document owner.');

  const file = waterfall.documents.find(d => d.id === data.documentId);
  if (!file) throw new Error('File not found');
  const documents = waterfall.documents.filter(d => d.id !== data.documentId);
  // This will trigger onWaterfallUpdate => cleanWaterfallMedias
  return waterfallSnap.ref.update({ documents });
};

interface StatementReviewRequest {
  waterfallId: string;
  statementId: string;
}

export const requestStatementReview = async (data: StatementReviewRequest, context: CallableContext) => {
  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  const { statementId, waterfallId } = data;
  if (!statementId || !waterfallId) throw new Error('Permission denied: missing data.');

  const waterfall = await getDocument<Waterfall>(`waterfall/${waterfallId}`);
  const producer = waterfall.rightholders.find(r => r.roles.includes('producer'));
  if (!producer) throw new Error(`Producer not found for waterfall ${waterfallId}`);

  const permissions = await getCollection<WaterfallPermissions>(`waterfall/${waterfallId}/permissions`);
  const producerOrgIds = permissions.filter(p => p.rightholderIds.includes(producer.id)).map(p => p.id);
  if (!producerOrgIds.length) throw new Error(`Producer org not found for waterfall ${waterfallId}`);
  const producerUsers = await queryDocuments<User>(db.collection('users').where('orgId', 'in', producerOrgIds));

  const statement = await getDocument<Statement>(`waterfall/${waterfall.id}/statements/${statementId}`);
  if (!statement) throw new Error(`Statement not found : waterfall/${waterfall.id}/statements/${statementId}`);

  const userDocument = await getDocument<User>(`users/${context.auth.uid}`);
  const user = createPublicUser(userDocument);
  const movie = await getDocument<Movie>(`movies/${waterfallId}`);
  const organization = await getDocument<Organization>(`orgs/${user.orgId}`);

  const mailRequest = userRequestedStatementReview(user, organization, statementId, movie);
  const from = getMailSender('waterfall');

  const notificationToUser = createNotification({
    toUserId: user.uid,
    docId: waterfallId,
    statementId,
    _meta: createInternalDocumentMeta({ createdFrom: 'waterfall' }),
    type: 'requestForStatementReviewCreated'
  });

  const notifications: Notification[] = [notificationToUser];

  for (const prodUser of producerUsers) {
    notifications.push(createNotification({
      toUserId: prodUser.uid,
      docId: waterfallId,
      user,
      statementId,
      _meta: createInternalDocumentMeta({ createdFrom: 'waterfall' }),
      type: 'userRequestedStatementReview'
    }));
  }

  await triggerNotifications(notifications);
  await sendMail(mailRequest, from, groupIds.noUnsubscribeLink).catch(e => console.warn(e.message));
  return true;
};