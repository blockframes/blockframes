import { Firestore } from '../types';
import { omit } from 'lodash';
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

      if (!newData) {
        console.error(doc.ref.path, notification, newData);
      }

      return batch.update(doc.ref, newData);
    }
  });

  invitations.docs.forEach(doc => {
    const invitation = doc.data();
    const { organization, user } = invitation;

    if (organization || user) {
      const newData = updateUserAndOrganization(invitation);

      if (!newData) {
        console.error(doc.ref.path, invitation, newData);
      }
      
      return batch.update(doc.ref, newData);
    }
  });

  await batch.commit();
  console.log('Updating notifications and invitatins collections done.');
}

const upgradeOrg = (organization) => (
  {
    ...omit(organization, ['name']),
    denomination: {
      full: organization.name ? organization.name : 'main',
      public: organization.name ? organization.name : 'main'
    }
  }
)

const upgradeUser = (user) => ({
  ...omit(user, ['name', 'surname']),
    firstName: user.name ? user.name : 'First Name',
    lastName: user.surname ? user.surname : 'Last Name'
})

/**
 * Update and return the data in a new format
 * @param document a notification or an invitation
 */
function updateUserAndOrganization(document: any) {
  const update: {[key: string]: any} = {}

  if (document.organization) {
    update.organizaton = upgradeOrg(document.organization)
  }

  if (document.user) {
    update.user = upgradeUser(document.user)
  }

  return update;
}
