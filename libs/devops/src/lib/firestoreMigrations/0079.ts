import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { Organization, Invitation, Notification, PublicOrganization } from '@blockframes/model';

// Array for special Organizations
const specialOrgs = [
  { id: 'BsQS0gTqFJ1mpkJVZjNf', field: 'full' },
  { id: 'D453XC3B8VEP64RLDbac', field: 'full' },
  { id: 'AQRsAqOCjozQdLEkSWxb', field: 'full' },
  { id: '2u1lVQ1AziAhgZdFBZp5', field: 'full' },
  { id: 'OWZ6SHhsmM6C27fbEGPQ', field: 'full' },
  { id: 'wptWZnXiAzjIJorVbycy', field: 'public' },
  { id: 'VJFAyk8QTJkzilFzIM9d', field: 'full' },
  { id: 'qSKCCJxDPiYenuO6tcSi', field: 'public' },
  { id: 'XDAqvNGZJAaxw8LGyq4f', field: 'full' }
] as { id: string, field: 'public' | 'full'}[];

/**
 * Update name from organizations, invitations and notifications documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  console.log('Migrate Organizations');
  await migrateOrganizations(db);
  console.log('Migrate Invitations');
  await migrateInvitations(db);
  console.log('Migrate Notifications');
  return migrateNotifications(db);
}

async function migrateOrganizations(db: Firestore) {
  const orgs = await db.collection('orgs').get();

  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data() as Organization;

    const { updatedOrg , update } = updateOrganization(org);

    // Delete fiscal number and bank accounts
    delete (updatedOrg as any)?.fiscalNumber;
    delete (updatedOrg as any)?.bankAccounts;

    if (update) await doc.ref.set(updatedOrg);
  }).catch(err => console.error(err));
}

async function migrateInvitations(db: Firestore) {
  const invitations = await db.collection('invitations').get();

  return runChunks(invitations.docs, async (doc) => {
    const invitationBase = doc.data() as Invitation;
    const type = invitationBase?.fromOrg ? 'fromOrg' : 'toOrg';
    const organization = invitationBase[type];

    const { updatedOrg, update } = updateOrganization(organization);
    invitationBase[type] = updatedOrg;

    if (update) await doc.ref.set(invitationBase);
  }).catch(err => console.error(err));
}

async function migrateNotifications(db: Firestore) {
  const notifications = await db.collection('notifications').get();

  return runChunks(notifications.docs, async (doc) => {
    const notificationBase = doc.data() as Notification;

    // Skip all notifications without organization or orgnization name
    if (!notificationBase?.organization?.name) return false;

    const organization = notificationBase.organization;

    const { updatedOrg, update } = updateOrganization(organization);
    notificationBase.organization = updatedOrg;

    if (update) await doc.ref.set(notificationBase);
  }).catch(err => console.error(err));
}


function updateOrganization(org: Organization | PublicOrganization) {
  let update = false;
  const fullName = (org as any).denomination.full;
  const publicName = (org as any).denomination.public;

  // If org is part of specialOrgs
  const specialOrgsIds = specialOrgs.map(org => org.id);
  if (specialOrgs.length && specialOrgsIds.includes(org.id)) {
    const index = specialOrgsIds.indexOf(org.id);
    const field = specialOrgs[index].field;
    org.name = field === 'full' ? fullName : publicName;
    delete (org as any).denomination;
    update = true;
  }

  // If org denomination public === full
  else if (fullName === publicName) {
    delete (org as any).denomination;
    org.name = fullName;
    update = true;
  }

  // If org have a value on full but not in public
  else if (fullName.length && !publicName.length) {
    delete (org as any).denomination;
    org.name = fullName;
    update = true;
  }

  // If org have a value on public but not in full
  else if (publicName.length && !fullName.length) {
    delete (org as any).denomination;
    org.name = publicName;
    update = true;
  }

  return { updatedOrg: org, update };
}