import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { auth, db } from './firebase';

type UserRecord = admin.auth.UserRecord;
type CallableContext = functions.https.CallableContext;

interface UserProposal {
  uid: string,
  email: string,
}

interface OrgProposal {
  id: string,
  name: string,
}

const onUserCreate = (user: UserRecord) => {
  const { email, uid } = user;
  return db.collection('users').doc(user.uid).set({ email, uid });
};

const findUserByMail = async (data: any, context: CallableContext): Promise<UserProposal[]> => {
  const prefix: string = decodeURIComponent(data.prefix);

  // Leave if the prefix is too short (do not search every users in the universe).
  if (prefix.length < 2) {
    return [];
  }

  // String magic to figure out a prefixEnd
  // Say prefix is 'aaa'. We want to search all strings between 'aaa' (prefix) and 'aab' (prefixEnd)
  // this will match: 'aaa', 'aaaa', 'aaahello', 'aaazerty', etc.
  const incLast: string = String.fromCharCode(prefix.slice(-1).charCodeAt(0) + 1);
  const prefixEnd: string = prefix.slice(0, -1) + incLast;

  return db.collection('users')
    .where('email', '>=', prefix)
    .where('email', '<', prefixEnd)
    .get()
    .then(query => {
      // leave if there are too many results.
      if (query.size > 10) {
        return [];
      }

      return query.docs.map(doc => ({ uid: doc.id, email: doc.data().email }));
    });
};

const findOrgByName = async (data: any, context: CallableContext): Promise<OrgProposal[]> => {
  const prefix: string = decodeURIComponent(data.prefix);

  // Leave if the prefix is too short (do not search every users in the universe).
  if (prefix.length < 2) {
    return [];
  }

  // String magic to figure out a prefixEnd
  // Say prefix is 'aaa'. We want to search all strings between 'aaa' (prefix) and 'aab' (prefixEnd)
  // this will match: 'aaa', 'aaaa', 'aaahello', 'aaazerty', etc.
  const incLast: string = String.fromCharCode(prefix.slice(-1).charCodeAt(0) + 1);
  const prefixEnd: string = prefix.slice(0, -1) + incLast;

  return db.collection('orgs')
    .where('name', '>=', prefix)
    .where('name', '<', prefixEnd)
    .get()
    .then(matchingOrgs => {
      // leave if there are too many results.
      if (matchingOrgs.size > 10) {
        return [];
      }

      return matchingOrgs.docs.map(matchingOrg => ({ id: matchingOrg.id, name: matchingOrg.data().name }));
    });
};

const getOrCreateUserByMail = async (data: any, context: CallableContext): Promise<UserProposal> => {
  const { email } = data;

  try {
    const user = await auth.getUserByEmail(email);
    return { uid: user.uid, email };
  } catch {
    const user = await auth.createUser({
      email,
      emailVerified: false,
      disabled: false
    });

    // TODO: trigger API to send a mail.

    return { uid: user.uid, email };
  }
};

export { onUserCreate, findUserByMail, findOrgByName, getOrCreateUserByMail };
