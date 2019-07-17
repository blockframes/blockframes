import { firestore } from 'firebase/app';
import { DocInformations } from 'libs/notification/notification/+state';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  appIcon: string;
  message: string;
  userId: string;
  path: string;
  docInformations: DocInformations;
  state: 'accepted' | 'declined' | 'pending';
  date: Timestamp;
};
