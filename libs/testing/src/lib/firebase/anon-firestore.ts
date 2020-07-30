import { chunk } from 'lodash';
import { firestore } from 'firebase-admin';
import * as faker from 'faker';

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
  return runChunks(
    updates,
    update => {
      return update.ref.set(update.org, { merge: false });
    },
    25
  );
  // return Promise.all(updates);
}

// export async function cleanOrgs(db: firestore.Firestore) {
//   console.log('starting orgs anonimisation');
//   const orgsQuerySnapshot = await db.collection('orgs').get();
//   return runChunks(orgsQuerySnapshot.docs, snapshot => {
//     const org = snapshot.data();
//     org.id = snapshot.id;
//     const companyName = faker.company.companyName();
//     const denomination = {
//       full: companyName,
//       public: companyName
//     };
//     org.denomination = denomination;
//     const email = `${faker.name.firstName()}.${faker.name.lastName()}-${companyName
//       .replace(/\s/g, '')
//       .replace(/\W/g, '')}-fakeOrg@cascade8.com`;
//     org.email = email;
//     // return snapshot.ref.set(org, { merge: false });
//     return snapshot.ref.set(org);
//   });
// }

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
  const users = usersQuerySnapshot.docs.map(snapshot => {
    const user = snapshot.data();
    user.id = snapshot.id;
    return user;
  });

  const updates = users.map(user => {
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
      ref: db.collection('users').doc(user.id),
      data: { firstName, lastName, email: newEmail }
    };
  });
  return runChunks(updates, update => update.ref.set(update.data, { merge: true }));
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
    const { organisation: { id: orgId } = { id: '' } } = notification;
    // tslint:disable-next-line: no-non-null-assertion
    const org = orgs.find(thisOrg => thisOrg.id === orgId);
    if (notification?.organisation?.denomination)
      notification.organisation.denomination = org?.denomination || {};
    const { user: { uid } = { uid: '' } } = notification;
    const user = users.find(thisUser => thisUser.uid === uid);
    delete user?.watermark;
    notification.user = user || {};
    // return snapshot.ref.set(notification, { merge: false });
    return { ref: snapshot.ref, data: notification };
  });
  return runChunks(updates, update => update.ref.set(update.data, { merge: false }));
  // return Promise.all(updates);
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
    // return snapshot.ref.set(invitation, { merge: false });
    return { ref: snapshot.ref, data: invitation };
  });
  // return Promise.all(updates);
  return runChunks(updates, update => update.ref.set(update.data, { merge: false }));
}

export async function runChunks<K = any>(batch: K[], cb: (p: K) => Promise<any>, chunkSize = 10) {
  const chunks = chunk(batch, chunkSize);
  return chunks.map(async (subChunk, i) => {
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    const promises = subChunk.map(cb);
    return await Promise.all(promises);
  });
  // function* getChunk() {
  //   yield chunks.pop().map(chunk => chunk.map())
  // }

  // for (let i = 0; i < chunks.length; i++) {
  //   const chunk = chunks[i];
  //   console.log(`Processing chunk ${i + 1}/${chunks.length}`);
  //   const promises = chunk.map(cb);
  //   await Promise.all(promises);
  // }
}

//  await runChunks(moviesTestSet, async (m) => {
//       const movieRef = db.collection('movies').doc(m.id);
//       await movieRef.set(m);
//     }, 50);
