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
  dataRestorePage,
  dataQuorumCreatePage,
} from './assets/admin-templates';
import { getAdminIds } from './data/internals';
import * as backup from './backup';
import { deployMovieContract, setInitialRepartition } from '@blockframes/ethers/quorum/quorum';
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
 * for admin operations. We compare the value of the `password` field, submitted with
 * the request, to the admin password in the environment.
 *
 * See issue#700 for details.
 *
 * @param f a function to protect, should be a request handler for a POST request.
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


// Quorum Deploy & setup a movie smart-contract
// ==============================

adminApp.get(`${ADMIN_DATA_PATH}/quorum/create/:movieId`, async (req: express.Request, res: express.Response) => {

  // retrieve the movie from firestore
  const { movieId } = req.params;
  const movieRef = db.collection('movies').doc(movieId);
  const movie = await movieRef.get();

  if (!movie.exists) {
    return res.send(`Error : movie Id ${movieId} not found in the database!`);
  }

  const movieData = movie.data();

  // if the movie has already an initialized smart-contract associated no need to go further
  if (!!movieData!.quorumSmartContractAddress && !!movieData!.quorumSmartContractInitialized) {
    return res.send(`Error : movie Id ${movieId} has already an initialized smart-contract (${movieData!.quorumSmartContractAddress})!`);
  }

  // return the html form
  return res.send(dataQuorumCreatePage(movieData!.main.title.international));
});


adminApp.post(`${ADMIN_DATA_PATH}/quorum/create/:movieId`, async (req: express.Request, res: express.Response) => {
  const { quorumPassword, participantShare } = req.body;

  if (participantShare < 0 || participantShare > 100) {
    return res.send(`Error : 'participantShare' must be a valid percentage [0-100] but ${participantShare} was given!`);
  }

  // retrieve the movie from firestore
  const { movieId } = req.params;
  const movieRef = db.collection('movies').doc(movieId);
  const movie = await movieRef.get();

  if (!movie.exists) {
    return res.send(`Error : movie Id ${movieId} not found in the database!`);
  }

  const movieData = movie.data();

  try {
    let contractAddress = '';
    let deployTxReceipt: any;
    let repartitionTxReceipt: any;

    // STEP (1) : DEPLOY
    if (!movieData!.quorumSmartContractAddress) {

      deployTxReceipt = await deployMovieContract(quorumPassword);
      contractAddress = deployTxReceipt['creates'];

      // save to firestore in case workflow crash half-way
      movieRef.update({
        quorumSmartContractAddress: contractAddress,
        quorumSmartContractInitialized: false,
      });

    } else {
      contractAddress = movieData!.quorumSmartContractAddress;
    }

    // STEP (2) SET INITIAL REPARTITION
    if (!movieData!.quorumSmartContractInitialized) {
      repartitionTxReceipt = await setInitialRepartition(quorumPassword, contractAddress, participantShare);
      movieRef.update({
        quorumSmartContractInitialized: true,
      });
    } else {
      movieRef.update({
        quorumSmartContractInitialized: false,
      });
    }

    // STEP (3) RETURN CORRESPONDING RESULT
    let deployStatus = '';
    if (!!deployTxReceipt) {
      deployStatus = `✅ : The smart-contract was successfully deployed @ ${contractAddress} ! <br/> proof : <code>${deployTxReceipt['hash']}</code><br/>`;
    } else {
      deployStatus = `❌ : The deploy has failed, please try again !`;
    }

    let repartitionStatus = '';
    if (!!repartitionTxReceipt) {
      repartitionStatus = `✅ : The initial repartition was correctly set to ${participantShare}% - ${100 - participantShare}% ! <br/> proof : <code>${repartitionTxReceipt['hash']}</code><br/>`;
    } else {
      repartitionStatus = `❌ : The initial repartition has failed, please try again (this will have no impact on previous deploy) !`;
    }

    return res.send(`
    ${deployStatus}<br/>
    ${repartitionStatus}
    `);

  } catch(error) {
    console.log('** !! SOMETHING HAS FAILED DURING DEPLOY !! **'); // logging to firebase functions console

    return res.send({
      message: '❌ AN ERROR HAS OCCURRED ! PLEASE DON\'T LEAVE THIS PAGE AND SHOW IT TO A DEV ! ❌',
      error
    }); // return error to client (c8 admin) browser for debug purpose
  }
});
