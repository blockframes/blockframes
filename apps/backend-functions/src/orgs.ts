/**
 * Organization-related code,
 *
 * Right now this is solely used to update our algolia index (full-text search on org names).
 */
import express from 'express';
import { db, DocumentReference, functions, getUserMail } from './internals/firebase';
import { deleteSearchableOrg, storeSearchableOrg } from './internals/algolia';
import { sendMail } from './internals/email';
import { AppAccessStatus, OrganizationPermissions, OrganizationStatus } from './data/types';
import {
  organizationCanAccessApp,
  organizationCreated,
  organizationWasAccepted
} from './assets/mail-templates';
import {
  acceptNewOrgPage,
  acceptNewOrgPageComplete,
  allowAccessToAppPage,
  allowAccessToAppPageComplete
} from './assets/admin-templates';

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
    sendMail(organizationCreated(org.id)),
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

/** Update an organization when it has been accepted by admins. */
function acceptOrganization(organizationRef: DocumentReference): Promise<any> {
  return organizationRef.update({ status: OrganizationStatus.accepted });
}

async function getSuperAdmins(organizationId: string): Promise<string[]> {
  const permissionsRef = db.collection('permissions').doc(organizationId);
  const permissionsDoc = await permissionsRef.get();

  if (!permissionsDoc.exists) {
    throw new Error(`organization: ${organizationId} does not exists`);
  }

  const { superAdmins } = permissionsDoc.data() as OrganizationPermissions;
  return superAdmins;
}

async function mailOrganizationAdminOnAccept(organizationId: string): Promise<any> {
  const superAdmins = await getSuperAdmins(organizationId);

  return Promise.all(
    superAdmins.map(async userId => {
      const email = await getUserMail(userId);
      if (!email) {
        return;
      }
      return sendMail(organizationWasAccepted(email));
    })
  );
}

// We serve an express app in the function
// this let us deal easily with get / post, url params, etc.
export const onAcceptNewOrg = express();

// When an admin access the page, they'll see the "accept org" form.
onAcceptNewOrg.get(
  '/admin/acceptOrganization/:organizationId',
  async (req: express.Request, res: express.Response) => {
    const { organizationId } = req.params;
    res.send(acceptNewOrgPage(organizationId));
  }
);

// When an admin submit the "accept org" form, it'll update the organization, send mails, etc.
onAcceptNewOrg.post(
  '/admin/acceptOrganization/:organizationId',
  async (req: express.Request, res: express.Response) => {
    const { organizationId } = req.params;
    const organizationRef = db.collection('orgs').doc(organizationId);

    await acceptOrganization(organizationRef);
    await mailOrganizationAdminOnAccept(organizationId);
    return res.send(acceptNewOrgPageComplete(organizationId));
  }
);

// Organization Administration: allow apps for orgs
// ================================================

export const onAllowAccessToApp = express();

onAllowAccessToApp.get('/:orgId/:appId', async (req: express.Request, res: express.Response) => {
  const { orgId, appId } = req.params;
  return res.send(allowAccessToAppPage(orgId, appId));
});

function allowAccessToApp(organizationId: string, appId: string): Promise<any> {
  const requestRef = db.collection('app-requests').doc(organizationId);
  return requestRef.update({ [appId]: AppAccessStatus.accepted });
}

async function mailOrganizationAdminOnAccessToApp(
  organizationId: string,
  appId: string
): Promise<any> {
  const superAdmins = await getSuperAdmins(organizationId);

  return Promise.all(
    superAdmins.map(async userId => {
      const email = await getUserMail(userId);
      if (!email) {
        return;
      }
      return sendMail(organizationCanAccessApp(email, appId));
    })
  );
}

onAllowAccessToApp.post('/:orgId/:appId', async (req: express.Request, res: express.Response) => {
  const { organizationId, appId } = req.params;

  await allowAccessToApp(organizationId, appId);
  await mailOrganizationAdminOnAccessToApp(organizationId, appId);
  return res.send(allowAccessToAppPageComplete(organizationId, appId));
});
