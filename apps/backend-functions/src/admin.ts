/**
 * Minimal admin implementation to let cascade8 admins
 * take care of managing organization access.
 *
 */
import express from 'express';
import { ADMIN_DATA_PATH } from './templates/mail';
import { dataBackupPage, dataRestorePage } from './templates/admin';
import * as backup from './backup';
import { adminPassword } from './environments/environment';


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
/* @todo(#3640) 09/09/2020: We removed all ethers dependencies
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
  return res.send(dataQuorumCreatePage(movieData!.title.international));
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

  } catch (error) {
    console.log('** !! SOMETHING HAS FAILED DURING DEPLOY !! **'); // logging to firebase functions console

    return res.send({
      message: '❌ AN ERROR HAS OCCURRED ! PLEASE DON\'T LEAVE THIS PAGE AND SHOW IT TO A DEV ! ❌',
      error
    }); // return error to client (c8 admin) browser for debug purpose
  }
});
*/