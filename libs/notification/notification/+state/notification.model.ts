import { firestore } from 'firebase/app';
import { DocInformations } from 'libs/notification/notification/+state';
type Timestamp = firestore.Timestamp;

export interface Notification {
  id: string;
  appIcon: string;
  message: string;
  userId: string[];
  path: string;
  docInformations: DocInformations;
  isRead: boolean;
  date: Timestamp;
  stakeholderId: string;
};

export interface DocInformations {
  id: string,
  type : 'movie' | 'delivery'
}
