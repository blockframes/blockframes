import { StorageFile } from "@blockframes/media/+state/media.firestore";
import { NotificationBase } from "./notification.firestore";

export interface Notification extends NotificationBase<Date> {
  message: { text: string, link?: string }[];
  imgRef?: StorageFile;
  placeholderUrl?: string;
  url?: string;
}
