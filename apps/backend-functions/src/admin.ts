/**
 * Minimal admin implementation to let cascade8 admins
 * take care of managing organization access.
 *
 */
import express from 'express';
import { db, DocumentReference, functions, getUserMail } from './internals/firebase';
import { sendMail } from './internals/email';
import { AppAccessStatus, OrganizationStatus } from './data/types';
import {
  ADMIN_ACCEPT_ORG_PATH,
  ADMIN_ACCESS_TO_APP_PATH,
  ADMIN_DATA_PATH,
  organizationCanAccessApp,
  organizationRequestedAccessToApp,
} from './assets/mail-templates';
import {
  acceptNewOrgPage,
  acceptNewOrgPageComplete,
  allowAccessToAppPage,
  allowAccessToAppPageComplete,
  dataBackupPage,
  dataRestorePage
} from './assets/admin-templates';
import { getAdminIds } from './data/internals';
import * as backup from './backup';
import { adminPassword } from './environments/environment';

// TODO(#714): Synchronize data types with the frontend
const APPS = ['delivery', 'movie-financing', 'stories-and-more', 'catalog'];

/**
 * Handles firestore update on request to application access,
 */
export async function onRequestAccessToAppWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) {
  const { orgId } = context.params;

  const before = change.before.data();
  const after = change.after.data();

  if (!after) {
    return;
  }

  const requestedApps = APPS.filter(appId => {
    return after && after[appId] === 'requested' && (!before || before[appId] !== 'requested');
  });

  return Promise.all(
    requestedApps.map(appId => sendMail(organizationRequestedAccessToApp(orgId, appId)))
  );
}

/**
 * Decorates another function, this will check that the password is valid
 * for admin operations.
 *
 * See issue#700 for details.
 *
 * @param f a function to protect, should be post'd.
 */
function checkPasswordOnPost(f: any) {
  return (req: express.Request, res: express.Response) => {
    const password = req.body.password;

    if (password === adminPassword) {
      return f(req, res);
    } else {
      return res.status(403).send('Invalid password');
    }
  };
}

// We serve an express app at the /admin URL
// this let us deal easily with get / post, url params, etc.
export const adminApp = express();

// Organization Administration: Accept new orgs
// ============================================

/** Update an organization when it has been accepted by admins. */
function acceptOrganization(organizationRef: DocumentReference): Promise<any> {
  return organizationRef.update({ status: OrganizationStatus.accepted });
}

async function mailOrganizationAdminOnAccept(organizationId: string): Promise<any> {
  const admins = await getAdminIds(organizationId);

  return Promise.all(
    admins.map(async userId => {
      const email = await getUserMail(userId);
      if (!email) {
        return;
      }
    })
  );
}

// When an admin access the page, they'll see the "accept org" form.
adminApp.get(
  `${ADMIN_ACCEPT_ORG_PATH}/:organizationId`,
  async (req: express.Request, res: express.Response) => {
    const { organizationId } = req.params;
    res.send(acceptNewOrgPage(organizationId));
  }
);

// When an admin submit the "accept org" form, it'll update the organization, send mails, etc.
adminApp.post(
  `${ADMIN_ACCEPT_ORG_PATH}/:organizationId`,
  checkPasswordOnPost(async (req: express.Request, res: express.Response) => {
    const { organizationId } = req.params;
    const organizationRef = db.collection('orgs').doc(organizationId);

    await acceptOrganization(organizationRef);
    await mailOrganizationAdminOnAccept(organizationId);
    return res.send(acceptNewOrgPageComplete(organizationId));
  })
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
  const admins = await getAdminIds(organizationId);

  return Promise.all(
    admins.map(async userId => {
      const email = await getUserMail(userId);
      if (!email) {
        return;
      }
      return sendMail(organizationCanAccessApp(email, appId));
    })
  );
}

adminApp.get(
  `${ADMIN_ACCESS_TO_APP_PATH}/:orgId/:appId`,
  async (req: express.Request, res: express.Response) => {
    const { orgId, appId } = req.params;
    return res.send(allowAccessToAppPage(orgId, appId));
  }
);

adminApp.post(
  `${ADMIN_ACCESS_TO_APP_PATH}/:orgId/:appId`,
  checkPasswordOnPost(async (req: express.Request, res: express.Response) => {
    const { orgId, appId } = req.params;

    await allowAccessToApp(orgId, appId);
    await mailOrganizationAdminOnAccessToApp(orgId, appId);
    return res.send(allowAccessToAppPageComplete(orgId, appId));
  })
);

// Backups / Restore the database
// ==============================

adminApp.get(`${ADMIN_DATA_PATH}/backup`, async (req: express.Request, res: express.Response) => {
  return res.send(dataBackupPage());
});

adminApp.post(`${ADMIN_DATA_PATH}/backup`, checkPasswordOnPost(backup.freeze));

adminApp.get(`${ADMIN_DATA_PATH}/restore`, async (req: express.Request, res: express.Response) => {
  return res.send(dataRestorePage());
});

adminApp.post(`${ADMIN_DATA_PATH}/restore`, checkPasswordOnPost(backup.restore));
