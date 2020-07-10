import { pubsub } from 'firebase-functions';
import { freeze } from '../backup';
import * as env from '../environments/environment';

export default pubsub.schedule('0 0 * * *').onRun(context => {
  if (!env?.enableNightlyFirestoreBackup) return null;
  // const { eventId, eventType, params, resource, timestamp, auth, authType } = context;
  console.log('This will be run daily! Running DB Backup!');
  console.log('Message: ', context.params);
  // Mock - freeze calls second param - return resp.status(200).send('success');
  return freeze(
    {},
    {
      // TODO: This is messy - decouple backup code in testing library
      // TODO: better method - https://firebase.google.com/docs/firestore/manage-data/export-import
      // @ts-ignore
      status: number => ({ send: string => null })
    }
  );
  // return null;
});
