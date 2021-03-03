import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

/**
 * Update notification documents to fit new specs for #4046
*/
export async function upgrade(db: Firestore) {
  const notifications = await db.collection('notifications').get();

  await runChunks(notifications.docs, async (notificationDoc) => {
    const data = notificationDoc.data();

    if (data.date !== undefined) {
      data._meta = {
        createdBy: 'internal',
        createdAt: data.date
      };
    }

    if (data.isRead !== undefined) {
      data.app = { isRead: data.isRead };
    }

    delete data.date;
    delete data.isRead;

    await notificationDoc.ref.set(data);
  });
}