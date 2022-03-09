import { db, auth } from '../testing-cypress';

export async function getRandomEmail() {
  const { email } = await getRandomUser();
  console.log(email);
  return email;
}

export async function getRandomUser() {
  const userQuery = await db.collection('users').get();
  const users = userQuery.docs.map((doc) => doc.data());
  const randomUser = users[Math.floor(Math.random() * users.length)];
  return randomUser;
}

export async function getRandomOrg(data: { application: string; access: 'marketplace' | 'dashboard' }) {
  const { application, access } = data;
  const userQuery = await db
    .collection('orgs')
    .where('status', '==', 'accepted')
    .where(`appAccess.${application}.marketplace`, '==', true)
    .where(`appAccess.${application}.dashboard`, '==', access === 'dashboard')
    .get();
  const orgs = userQuery.docs.map((doc) => doc.data());
  const randomOrg = orgs[Math.floor(Math.random() * orgs.length)];
  return randomOrg;
}

export async function validateOrg(orgName: string) {
  const userQuery = await db.collection('orgs').where('denomination.full', '==', orgName).get();
  const org = userQuery.docs.pop().data();
  const orgId = org.id;
  const docRef = db.collection('orgs').doc(orgId);
  return docRef.update({ status: 'accepted' });
}

export async function acceptUserInOrg(userEmail: string) {
  const user = await auth.getUserByEmail(userEmail);
  const userQuery = await db.collection('invitations').where('fromUser.uid', '==', user.uid).get();
  const invitation = userQuery.docs.pop().data();
  console.log(invitation);
  return db.collection('invitations').doc(invitation.id).update({ status: 'accepted' });
}
