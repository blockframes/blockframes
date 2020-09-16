import { Firestore } from '../types';


export async function upgrade(db: Firestore) {
  const invitations = await db.collection('invitations').get();
  const notifications = await db.collection('notifications').get();
  const orgs = await db.collection('orgs').get();
  const batch = db.batch();

  // Update invitations with organization
  invitations.docs.forEach(doc => {
    const invitation = doc.data();
    const { organizaton } = invitation;

    if (organizaton) {
      delete invitation.organizaton;
      const newData = {
        ...invitation,
        organization: organizaton,
      };

      if (!newData) {
        throw new Error(`No new data to set`);
      }

      return batch.set(doc.ref, newData);
    }
  });

  // Update notification with organization
  notifications.docs.forEach(doc => {
    const notification = doc.data();
    const { organizaton } = notification;

    if (organizaton) {
      delete notification.organizaton;
      const newData = {
        ...notification,
        organization: organizaton,
      };

      if (!newData) {
        throw new Error(`No new data to set`);
      }

      return batch.set(doc.ref, newData);
    }
  });

  // Update some organization activity
  orgs.docs.forEach(doc => {
    const org = doc.data();

    const newData = orgActivityUpdate(org);
    return batch.update(doc.ref, newData);
  })

  await batch.commit();
  console.log('Invitations, notifications and organizations updated.');
}

const orgActivityUpdate = (org) => {
  if (
    org.id === 'i4MGcUBEIjCy24dVkTiL' ||
    org.id === 'GdFUevWIifjk6VEYgfCT' ||
    org.id === 'xpSPU7fz2NnTIppi0ZZx' ||
    org.id === 'PFiUE7CDu0PoknMZmILD' ||
    org.id === 'e1VXeusNJK6pb8kmVnUn'
    ) {
      return { activity: 'intlSales' };
    }
  else if (org.id === 'OW5anWKJyM9aOhgOREKp' || org.id === 'XQUqGRCxK4Ul9io7iLly' ) {
    return { activity: 'distribution' };
  }
  else if (org.id === '58Gme3bBCzfqywX3d13d' || org.id === 'KYFewTeB8nBMKSSmzq88' ) {
    return { activity: 'vodPlatform' };
  }
  else if (org.id === 'jnbHKBP5YLvRQGcyQ8In' ) {
    return { activity: 'filmLibrary' }
  }
  else if (org.id === '51x9zk4ejbhjADq2uMcC' ) {
    return { activity: 'production' };
  }
  else if (org.id === 'jM16CZfMkk4aHR8ZwOhL' ) {
    return { activity: 'tvBroadcast' };
  } else {
    return { activity: org.activity };
  }
}
