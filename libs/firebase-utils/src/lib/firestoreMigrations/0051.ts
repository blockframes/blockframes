import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

/**
 * Update notification documents to fit new specs for #4046
*/
export async function upgrade(db: Firestore) {
  const notifications = await db.collection('notifications').get();

  return runChunks(notifications.docs, async (notificationsDoc) => {
    const data = notificationsDoc.data();

    data._meta =  {
      createdBy: 'internal',
      createdAt: data.date,
      email: {
        active: false,
        sent: false,
      },
      app: {
        active: true,
        isRead: data.isRead,
      },
    }
    delete data.date;
    delete data.isRead;
    await notificationsDoc.ref.set(data);
  });


  //@TODO #4046 also update user docs
}