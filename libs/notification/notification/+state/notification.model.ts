import { firestore } from 'firebase/app';
import { DocID } from 'libs/notification/notification/+state';
type Timestamp = firestore.Timestamp;

export interface Notification {
  id: string;
  app: string;
  message: string;
  userId: string[];
  path: string;
  docID: DocID;
  isRead: boolean;
  date: Date | Timestamp;
  stakeholderId: string;
};

export interface DocID {
  id: string,
  type : 'movie' | 'delivery'
}
