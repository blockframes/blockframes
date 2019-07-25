import { firestore } from 'firebase/app';
import { DocInformations } from 'libs/notification/notification/+state';
import { User } from '@blockframes/auth';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  appIcon: string;
  message: string;
  user?: User;
  orgId: string;
  path: string;
  docInformations: DocInformations;
  state: 'accepted' | 'declined' | 'pending';
  date: Timestamp;
}

export function createInvitation(params: Partial<Invitation> = {}): Invitation {
  function createUser(user: Partial<User> = {}) {
    return {
      uid: user.uid,
      email: user.email,
      name: user.name,
      surname: user.surname
    };
  }
  return {
    state: 'pending',
    date: firestore.Timestamp.now(),
    user: createUser(params.user),
    ...params
  } as Invitation;
}
