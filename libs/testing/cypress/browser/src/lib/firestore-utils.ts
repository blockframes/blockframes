import { adminAuth } from './adminAuth';
import { firestore } from './firestore';
import { User, Organization, Invitation } from '@blockframes/model';
import { UserRecord } from '@blockframes/firebase-utils/types';
import { WhereFilterOp } from 'firebase/firestore';

export function deleteUser(userEmail: string) {
  const query = { collection: 'users', field: 'email', operator: '==' as WhereFilterOp, value: userEmail };
  firestore.queryData(query).then((users: User[]) => {
    if (!users.length) return cy.log(`No previous user with ${userEmail}`);
    firestore.delete(`users/${users[0].uid}`);
  });
}

export function deleteOrg(orgName: string) {
  const query = { collection: 'orgs', field: 'name', operator: '==' as WhereFilterOp, value: orgName };
  firestore.queryData(query).then((orgs: Organization[]) => {
    if (!orgs.length) return cy.log(`No previous organization named ${orgName}`);
    firestore.delete(`orgs/${orgs[0].id}`);
  });
}

export function deleteInvitation(userEmail: string) {
  const query = { collection: 'invitations', field: 'fromUser.email', operator: '==' as WhereFilterOp, value: userEmail };
  firestore.queryData(query).then((invitations: Invitation[]) => {
    if (!invitations.length) return cy.log(`No previous invitations from ${userEmail}`);
    firestore.delete(`invitations/${invitations[0].id}`);
  });
}

export function validateUser(userEmail: string) {
  adminAuth.getUser(userEmail).then((user: UserRecord) => {
    adminAuth.updateUser({ uid: user.uid, update: { emailVerified: true } });
    firestore.update({ docPath: `users/${user.uid}`, field: '_meta.emailVerified', value: true });
  });
}

export function validateOrg(orgName: string) {
  firestore
    .queryData({ collection: 'orgs', field: 'name', operator: '==', value: orgName })
    .then((orgs: Organization[]) => {
      const [org] = orgs;
      firestore.update({ docPath: `orgs/${org.id}`, field: 'status', value: 'accepted' });
  });
}

export function validateInvitation(userEmail: string) {
  firestore
    .queryData({ collection: 'invitations', field: 'fromUser.email', operator: '==', value: userEmail })
    .then((invitations: Invitation[]) =>
      firestore.update({ docPath: `invitations/${invitations[0].id}`, field: 'status', value: 'accepted' })
    );
}
