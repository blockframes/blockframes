import { firestore } from 'firebase/app';
import { DocInformations } from 'libs/notification/notification/+state';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  appIcon: string;
  message: string;
  userInformations: {
    userId: string,
    name: string,
    surname: string,
    email: string
  }
  orgId?: string;
  path: string;
  docInformations: DocInformations;
  state: 'accepted' | 'declined' | 'pending';
  date: Timestamp;
};
