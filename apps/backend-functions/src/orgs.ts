/**
 * Organization-related code,
 *
 * Right now this is solely used to update our algolia index (full-text search on org names).
 */
import express from 'express';
import { db, DocumentReference, functions, getUserMail } from './internals/firebase';
import { deleteSearchableOrg, storeSearchableOrg } from './internals/algolia';
import { sendMail } from './internals/email';
import { organizationCreate, organizationWasAccepted } from './assets/mailTemplates';
import { Organization } from './data/types';
import { acceptNewOrgPage, acceptNewOrgPageComplete } from './assets/adminTemplates';

export enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export function onOrganizationCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  const org = snap.data();
  const orgID = context.params.orgID;

  if (!org || !org.name) {
    console.error('Invalid org data:', org);
    throw new Error('organization update function got invalid org data');
  }

  return Promise.all([
    // Send a mail to c8 admin to accept the organization
    sendMail(organizationCreate(org.id)),
    // Update algolia's index
    storeSearchableOrg(orgID, org.name)
  ]);
}

export function onOrganizationUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const orgID = context.params.orgID;
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after || !after.name) {
    console.error('Invalid org data, before:', before, 'after:', after);
    throw new Error('organization update function got invalid org data');
  }

  // Update algolia's index
  if (before.name !== after.name) {
    return storeSearchableOrg(orgID, after.name);
  }

  return Promise.resolve(true); // no-op by default
}

export function onOrganizationDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  // Update algolia's index
  return deleteSearchableOrg(context.params.orgID);
}


// Organization Administration: Accept new orgs
// ============================================

function acceptOrganization(organizationRef: DocumentReference): Promise<any> {
  return organizationRef.update({ status: OrganizationStatus.accepted });
}

async function mailOrganizationAdminOnAccept(organizationRef: DocumentReference): Promise<any> {
  const { userIds } = (await organizationRef.get()).data() as Organization;

  return userIds.map(async userId => {
    const email = await getUserMail(userId);
    if (!email) {
      console.error('User:', userId, 'has no email!');
      return;
    }
    return sendMail(organizationWasAccepted(email));
  });
}

export const onAcceptNewOrg = express();

onAcceptNewOrg.get('/:orgId', async (req: express.Request, res: express.Response) => {
  const { orgId } = req.params;
  res.send(acceptNewOrgPage(orgId));
});

onAcceptNewOrg.post('/:orgId', async (req: express.Request, res: express.Response) => {
  const { orgId } = req.params;
  const organizationRef = db.collection('orgs').doc(orgId);

  await acceptOrganization(organizationRef);
  await mailOrganizationAdminOnAccept(organizationRef);

  return res.send(acceptNewOrgPageComplete(orgId));
});
