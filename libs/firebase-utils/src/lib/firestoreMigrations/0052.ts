import { Firestore } from '@blockframes/firebase-utils';
import { createUserSettings } from '@blockframes/user/types';
import { runChunks } from '../firebase-utils';

/**
 * Update notification and user documents to fit new specs for #4046
*/
export async function upgrade(db: Firestore) {
  const notifications = await db.collection('notifications').get();

  await runChunks(notifications.docs, async (notificationDoc) => {
    const data = notificationDoc.data();

    data._meta = {
      createdBy: 'internal',
      createdAt: data.date
    };

    data.app = { isRead: data.isRead };

    delete data.date;
    delete data.isRead;

    await notificationDoc.ref.set(data);
  });

  const users = await db.collection('users').get();

  return runChunks(users.docs, async (userDoc) => {
    const data = userDoc.data();

    data.settings = createUserSettings();

    await userDoc.ref.set(data);
  });
}