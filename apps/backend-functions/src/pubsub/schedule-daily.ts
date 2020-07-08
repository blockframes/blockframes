import { pubsub } from 'firebase-functions';
import { freeze } from '../backup';

export default pubsub.schedule('daily').onRun(context => {
  // const { eventId, eventType, params, resource, timestamp, auth, authType } = context;
  console.log('This will be run daily! Running DB Backup!');
  return freeze({}, {});
  // return null;
});
