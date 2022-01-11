import { StorageFile } from "@blockframes/media/+state/media.firestore";
import { NotificationBase } from "./notification.firestore";

export interface Notification extends NotificationBase<Date> {
  message: string;
  imgRef?: StorageFile;
  placeholderUrl?: string;
  url?: string;
  actionText?: string;
}
