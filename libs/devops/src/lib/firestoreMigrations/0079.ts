import { Firestore, runChunks } from '@blockframes/firebase-utils';

// Array for special Organizations
const specialOrgs = [
  // { id: 'org id', name: 'Org name' }
];

/**
 * Update organization from organizations, invitations and notifications documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  console.log('Migrate Organizations');
  await migrateOrganizations(db);
  console.log('Migrate Invitations');
  await migrateInvitations(db);
  console.log('Migrate Notifications');
  return await migrateNotifications(db);
}

async function migrateOrganizations(db: Firestore) {
  const orgs = await db.collection('orgs').get();

  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data() as any;

    // Skip all organization without denomination
    if (!org?.denomination) return false;

    const publicName = org.denomination.public;
    const fullName = org.denomination.full;

    const { updatedOrg, update } = updateOrganization(org, fullName, publicName);

    // Delete fiscal number
    delete updatedOrg.fiscalNumber;

    // Delete bank accouts
    delete updatedOrg.bankAccounts;

    if (update) await doc.ref.set(updatedOrg);
  }).catch(err => console.error(err));
}

async function migrateInvitations(db: Firestore) {
  const invitations = await db.collection('invitations').get();

  return runChunks(invitations.docs, async (doc) => {
    const invitationBase = doc.data() as any;
    const type = invitationBase?.fromOrg ? 'fromOrg' : 'toOrg';
    const invitation = invitationBase[type];

    // Skip all invitation without denomination
    if (!invitation?.denomination) return false;

    const publicName = invitation.denomination.public;
    const fullName = invitation.denomination.full;

    const { updatedOrg, update } = updateOrganization(invitation, fullName, publicName);
    invitationBase[type] = updatedOrg;

    if (update) await doc.ref.set(invitationBase);
  }).catch(err => console.error(err));
}

async function migrateNotifications(db: Firestore) {
  const notifications = await db.collection('notifications').get();

  return runChunks(notifications.docs, async (doc) => {
    const notificationBase = doc.data() as any;

    // Skip all notifications without organization or organization.denomination
    if (!notificationBase?.organization || !notificationBase.organization?.denomination) return false;

    const notification = notificationBase.organization;
    const publicName = notification.denomination.public;
    const fullName = notification.denomination.full;

    const { updatedOrg, update } = updateOrganization(notification, fullName, publicName);
    notificationBase.organization = updatedOrg;

    if (update) await doc.ref.set(notificationBase);
  }).catch(err => console.error(err));
}


function updateOrganization(org: any, fullName: string, publicName: string) {
  let update = false;

  // If org is part of specialOrgs
  const specialOrgsIds = specialOrgs.map(org => org.id);
  if (specialOrgs.length && specialOrgsIds.includes(org.id)) {
    const index = specialOrgsIds.indexOf(org.id);
    delete org.denomination;
    org.name = specialOrgs[index].name;
    update = true;
  }

  // If org denomination public === full
  else if (fullName === publicName) {
    delete org.denomination;
    org.name = fullName;
    update = true;
  }

  // If org have a value on full but not in public
  else if (fullName.length && !publicName.length) {
    delete org.denomination;
    org.name = fullName;
    update = true;
  }

  // If org have a value on public but not in full
  else if (publicName.length && !fullName.length) {
    delete org.denomination;
    org.name = publicName;
    update = true;
  }

  return { updatedOrg: org, update };
}