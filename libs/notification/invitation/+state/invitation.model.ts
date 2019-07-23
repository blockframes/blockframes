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
};

export function createInvitation(params: Partial<Invitation>, user?: User): Invitation {
  return {
    state: 'pending',
    date: firestore.Timestamp.now(),
    user,
    ...params
  } as Invitation
}
