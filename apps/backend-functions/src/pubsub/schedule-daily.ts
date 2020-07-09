import { pubsub } from 'firebase-functions';
import { freeze } from '../backup';

export default pubsub.schedule('0 0 * * *').onRun(context => {
  // const { eventId, eventType, params, resource, timestamp, auth, authType } = context;
  console.log('This will be run daily! Running DB Backup!');
  console.log('Context: ', context);
  // Mock - return resp.status(200).send('success');
  return freeze(
    {},
    {
      // TODO: This is messy - decouple backup code in testing library
      // @ts-ignore
      status: number => ({ send: string => null })
    }
  );
  // return null;
});
