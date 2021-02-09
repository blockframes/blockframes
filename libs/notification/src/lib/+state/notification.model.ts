import { StorageFile, StorageReference } from "@blockframes/media/+state/media.firestore";
import { NotificationBase } from "./notification.firestore";

export interface Notification extends NotificationBase<Date> {
  message: string;
  imgRef?: StorageReference & { storagePath: string };
  placeholderUrl?: string;
  url?: string;
}
