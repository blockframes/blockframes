/**
 * Minimal admin implementation to let cascade8 admins
 * take care of managing organization access.
 *
 */
import express from 'express';
import { db, DocumentReference, getUserMail } from './internals/firebase';
import { sendMail } from './internals/email';
import { AppAccessStatus, OrganizationPermissions, OrganizationStatus } from './data/types';
import { organizationCanAccessApp, organizationWasAccepted } from './assets/mail-templates';
import {
  acceptNewOrgPage,
  acceptNewOrgPageComplete,
  allowAccessToAppPage,
  allowAccessToAppPageComplete
} from './assets/admin-templates';

// We serve an express app at the /admin URL
// this let us deal easily with get / post, url params, etc.
export const adminApp = express();

/** Retrieve the list of superAdmins of an organization */
async function getSuperAdmins(organizationId: string): Promise<string[]> {
  const permissionsRef = db.collection('permissions').doc(organizationId);
  const permissionsDoc = await permissionsRef.get();

  if (!permissionsDoc.exists) {
    throw new Error(`organization: ${organizationId} does not exists`);
  }

  const { superAdmins } = permissionsDoc.data() as OrganizationPermissions;
  return superAdmins;
}

// Organization Administration: Accept new orgs
// ============================================

/** Update an organization when it has been accepted by admins. */
function acceptOrganization(organizationRef: DocumentReference): Promise<any> {
  return organizationRef.update({ status: OrganizationStatus.accepted });
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

// When an admin access the page, they'll see the "accept org" form.
adminApp.get(
  '/admin/acceptOrganization/:organizationId',
  async (req: express.Request, res: express.Response) => {
    const { organizationId } = req.params;
    res.send(acceptNewOrgPage(organizationId));
  }
);

// When an admin submit the "accept org" form, it'll update the organization, send mails, etc.
adminApp.post(
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

adminApp.get(
  '/admin/allowAccessToApp/:orgId/:appId',
  async (req: express.Request, res: express.Response) => {
    const { orgId, appId } = req.params;
    return res.send(allowAccessToAppPage(orgId, appId));
  }
);

adminApp.post(
  '/admin/allowAccessToApp/:orgId/:appId',
  async (req: express.Request, res: express.Response) => {
    const { orgId, appId } = req.params;

    await allowAccessToApp(orgId, appId);
    await mailOrganizationAdminOnAccessToApp(orgId, appId);
    return res.send(allowAccessToAppPageComplete(orgId, appId));
  }
);
