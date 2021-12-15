import { StorageFile } from "@blockframes/media/+state/media.firestore";
import { NotificationBase } from "./notification.firestore";

export type Notification = DefaultNotification | MovieSubmittedNotification;

export interface MovieSubmittedNotification extends DefaultNotification {
  type: 'movieSubmitted';
  titleId: string;
  title: string;
}

export interface DefaultNotification extends NotificationBase<Date> {
  message: string;
  imgRef?: StorageFile;
  placeholderUrl?: string;
  url?: string;
}
