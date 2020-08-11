import { chunk as chunkArray } from 'lodash';
import { firestore } from 'firebase-admin';
import * as faker from 'faker';

const CHUNK_SIZE = 20;

export async function cleanOrgs(db: firestore.Firestore) {
  console.log('starting orgs anonimisation');
  const orgsQuerySnapshot = await db.collection('orgs').get();
  const updates = orgsQuerySnapshot.docs.map(snapshot => {
    const org = snapshot.data();
    org.id = snapshot.id;

    const companyName = faker.company.companyName();
    const denomination = {
      full: companyName,
      public: companyName
    };
    org.denomination = denomination;
    const email = `${faker.name.firstName()}.${faker.name.lastName()}-${companyName
      .replace(/\s/g, '')
      .replace(/\W/g, '')}-fakeOrg@cascade8.com`;
    org.email = email;

    // return snapshot.ref.set(org, { merge: false });
    return { ref: snapshot.ref, org };
  });
  chunkArray(updates, CHUNK_SIZE).forEach(async chunk => {
    const batch = db.batch();
    chunk.forEach(update => batch.set(update.ref, update.org, { merge: false }));
    await batch.commit();
  });
  // return runChunks(
  //   updates,
  //   update => {
  //     return update.ref.set(update.org, { merge: false });
  //   },
  //   25
  // );
}

/**
 * This function will take a db as a parameter and clean it's emails as per anonimisation policy
 */
export async function cleanUsers(db: firestore.Firestore) {
  console.log('starting user anonimisation');
  const usersQuerySnapshot = await db.collection('users').get();
  const orgsQuerySnapshot = await db.collection('orgs').get();
  const orgs = orgsQuerySnapshot.docs.map(snapshot => {
    const org = snapshot.data();
    org.id = snapshot.id;
    return org;
  });

  const updates = usersQuerySnapshot.docs.map(snapshot => {
    const user = snapshot.data();
    const { orgId } = user;
    const org = orgs.find(thisOrg => thisOrg.id === orgId);
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    let newEmail = `${firstName}.${lastName}-${org?.denomination?.full.replace(/\W/g, '') ??
      'company'}-fake@cascade8.com`;
    newEmail = newEmail.replace(/\s/g, '');
    newEmail = newEmail.toLowerCase();

    // return db .collection('users') .doc(user.id) .set({ firstName, lastName, email: newEmail }, { merge: true });
    return {
      ref: snapshot.ref,
      data: { firstName, lastName, email: newEmail }
    };
  });
  // return runChunks(updates, update => update.ref.set(update.data, { merge: true }));
  chunkArray(updates, CHUNK_SIZE).forEach(async chunk => {
    const batch = db.batch();
    chunk.forEach(update => batch.set(update.ref, update.data, { merge: true }));
    await batch.commit();
  });
  // return Promise.all(updates);
}

export async function cleanNotifications(db: firestore.Firestore) {
  console.log('started notifications anonimisation');
  const [orgsQuerySnapshot, usersQuerySnapshot, notificationsQuerySnapshot] = await Promise.all([
    db.collection('orgs').get(),
    db.collection('users').get(),
    db.collection('notifications').get()
  ]);
  const orgs = orgsQuerySnapshot.docs.map(snapshot => snapshot.data());
  const users = usersQuerySnapshot.docs.map(snapshot => snapshot.data());

  const updates = notificationsQuerySnapshot.docs.map(snapshot => {
    const notification = snapshot.data();
    notification.id = snapshot.id;
    const { organization: { id: orgId } = { id: '' } } = notification;
    // tslint:disable-next-line: no-non-null-assertion
    const org = orgs.find(thisOrg => thisOrg.id === orgId);
    if (notification?.organization?.denomination)
      notification.organization.denomination = org?.denomination || {};
    const { user: { uid } = { uid: '' } } = notification;
    const user = users.find(thisUser => thisUser.uid === uid);
    delete user?.watermark;
    notification.user = user || {};
    return { ref: snapshot.ref, data: notification };
  });

  chunkArray(updates, CHUNK_SIZE).forEach(async chunk => {
    const batch = db.batch();
    chunk.forEach(update => batch.set(update.ref, update.data, { merge: false }));
    batch.commit();
  });
  // return runChunks(updates, update => update.ref.set(update.data, { merge: false }));
}

export async function cleanInvitations(db: firestore.Firestore) {
  console.log('started invitations anonimisation');

  const [orgsQuerySnapshot, usersQuerySnapshot, invitationsQuerySnapshot] = await Promise.all([
    db.collection('orgs').get(),
    db.collection('users').get(),
    db.collection('invitations').get()
  ]);
  const orgs = orgsQuerySnapshot.docs.map(snapshot => snapshot.data());
  const users = usersQuerySnapshot.docs.map(snapshot => snapshot.data());

  const updates = invitationsQuerySnapshot.docs.map(snapshot => {
    const invitation = snapshot.data();
    const { fromOrg: { id: orgId } = { id: '' } } = invitation;
    const org = orgs.find(thisOrg => thisOrg.id === orgId);
    invitation.fromOrg = org || {};
    const { toUser: { uid } = { uid: '' } } = invitation;
    const user = users.find(thisUser => thisUser.uid === uid);
    delete user?.watermark;
    invitation.toUser = user || {};
    return { ref: snapshot.ref, data: invitation };
  });
  chunkArray(updates, CHUNK_SIZE).forEach(async chunk => {
    const batch = db.batch();
    chunk.forEach(update => batch.set(update.ref, update.data, { merge: false }));
    await batch.commit();
  });
  // return runChunks(updates, update => update.ref.set(update.data, { merge: false }));
}

export async function runChunks<K = any>(batch: K[], cb: (p: K) => Promise<any>, chunkSize = 20) {
  const chunks = chunkArray(batch, chunkSize);
  return chunks.map(async (subChunk, i) => {
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    const promises = subChunk.map(cb);
    return await Promise.all(promises);
  });
}

export async function doubleCheck(db: firestore.Firestore) {
  console.log('Double checking theres no prod data left...');
  function isProdEmail(email: string | null): boolean {
    if (typeof email !== 'string') {
      console.count('Missing email found...');
      return false;
    }
    return email.split('@').pop() !== 'cascade8.com';
  }

  const [
    orgsQuerySnapshot,
    usersQuerySnapshot,
    invitationsQuerySnapshot,
    notificationsQuerySnapshot
  ] = await Promise.all([
    db.collection('orgs').get(),
    db.collection('users').get(),
    db.collection('invitations').get(),
    db.collection('notifications').get()
  ]);
  // All data loaded in memory at this stage
  console.log('loaded db...');
  const orgsFail = orgsQuerySnapshot.docs.filter(snapshot => {
    const org = snapshot.data();
    const email = org?.email as string;
    if (!email) console.log('record found without email...');
    return isProdEmail(email);
  });
  if (orgsFail.length) {
    console.log(`orgs: ${orgsFail.length}`);
    console.error(
      'The following prod orgs was found',
      orgsFail.map(snap => snap.id)
    );
  }

  const usersFail = usersQuerySnapshot.docs.filter(snapshot => {
    const user = snapshot.data();
    const email = user?.email;
    if (!email) console.log('record found without email...');
    return isProdEmail(email);
  });
  if (usersFail.length) {
    console.log(`users: ${usersFail.length}`);
    console.error(
      'The following prod data was found',
      usersFail.map(snap => snap.id)
    );
  }

  const invitationsFail = invitationsQuerySnapshot.docs.filter(snapshot => {
    const invitation = snapshot.data();
    const toEmail = invitation?.toUser?.email;
    const fromEmail = invitation?.fromOrg?.email;
    if (!toEmail || !fromEmail) console.log('record found without email');
    return isProdEmail(toEmail) || isProdEmail(fromEmail);
  });
  if (invitationsFail.length) {
    console.log(`invitations: ${invitationsFail.length}`);
    console.error(
      'The following prod data was found',
      invitationsFail.map(snap => snap.id)
    );
    // invitationsFail.forEach(async snapshot => {
    //   await snapshot.ref.update()
    // })
  }

  const notificationsFail = notificationsQuerySnapshot.docs.filter(snapshot => {
    const notification = snapshot.data();
    const orgEmail = notification?.organization?.email;
    const userEmail = notification?.user?.email;
    return isProdEmail(orgEmail) || isProdEmail(userEmail);
  });
  if (notificationsFail.length) {
    console.log(`notifications: ${notificationsFail.length}`);
    console.error(
      'The following prod data was found',
      notificationsFail.map(snap => snap.id)
    );
  }
  if (
    !invitationsQuerySnapshot &&
    !notificationsQuerySnapshot &&
    !orgsQuerySnapshot &&
    !usersQuerySnapshot
  ) {
    console.log('Your db is safely anonimised!');
  }
}
