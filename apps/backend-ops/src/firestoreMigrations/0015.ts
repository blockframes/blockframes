import { Firestore } from '../admin';

/**
 * Update user and organization in notifications and invitations collections
 */
export async function upgrade(db: Firestore) {
  const notifications = await db.collection('notifications').get();
  const invitations = await db.collection('invitations').get();
  const batch = db.batch();

  notifications.docs.forEach(doc => {
    const notification = doc.data();
    const { organization, user } = notification;

    if (organization || user) {
      const newData = updateUserAndOrganization(notification);
      return batch.set(doc.ref, newData);
    }
  });

  invitations.docs.forEach(doc => {
    const invitation = doc.data();
    const { organization, user } = invitation;

    if (organization || user) {
      const newData = updateUserAndOrganization(invitation);
      return batch.set(doc.ref, newData);
    }
  });

  await batch.commit();
  console.log('Updating notifications and invitatins collections done.');
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
        ...document.organization,
        denomination: {
          full: organization.name ? organization.name : 'main',
          public: organization.name ? organization.name : 'main'
        }
      },
      user: {
        firstName: user.name ? user.name : 'First Name',
        lastName: user.surname ? user.lastName : 'Last Name'
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
        ...document.organization,
        denomination: {
          full: organization.name ? organization.name : 'main',
          public: organization.name ? organization.name : 'main'
        }
      }
    };

    return newData;
  }
}
