import { Firestore } from '../admin';


/**
 * Update user and organization in notifications collection
 */
export async function updateNotifications(db: Firestore) {
  const notifications = await db.collection('notifications').get();
  const batch = db.batch();

  notifications.docs.forEach(doc => {
    const notification = doc.data();
    const { organization, user } = notification;

    if (organization || user) {
      const newData = updateUserAndOrganization(notification);
      return batch.set(doc.ref, newData);
    }
  });

  await batch.commit();
  console.log('Updating notifications collection done.');
}

/**
 * Update user and organization in invitations collection
 */
export async function updateInvitations(db: Firestore) {
  const notifications = await db.collection('invitations').get();
  const batch = db.batch();

  notifications.docs.forEach(doc => {
    const notification = doc.data();
    const { organization, user } = notification;

    if (organization || user) {
      const newData = updateUserAndOrganization(notification);
      return batch.set(doc.ref, newData);
    }
  });

  await batch.commit();
  console.log('Updating invitations collection done.');
}

/**
 * Update and return the data in a new format
 * @param document a notification or an invitation
 */
function updateUserAndOrganization(document: any) {
  const { organization, user } = document;

  if (organization && user) {
    delete document.organization.name;
    delete document.user.name;
    delete document.user.surname;

    const newData = {
      ...document,
      organization: {
        denomination: {
          full: document.organization.name,
          public: document.organization.name
        }
      },
      user: {
        firstName: document.user.name,
        lastName: document.user.surname
      }
    };
    return newData;
  }

  // Specific case of invitation on documents (where only organization appears)
  if (organization && !user) {
    delete document.organization.name;

    const newData = {
      ...document,
      organization: {
        denomination: {
          full: document.organization.name,
          public: document.organization.name
        }
      }
    };
    return newData;
  }
}
