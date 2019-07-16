import { firestore } from 'firebase/app';
import { DocID } from 'libs/notification/notification/+state';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  app: string;
  message: string;
  userId: string;
  path: string;
  docID: DocID;
  state: 'accepted' | 'declined' | 'pending';
  date: Date | Timestamp;
};
