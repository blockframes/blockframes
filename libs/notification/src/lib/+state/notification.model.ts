import { NotificationBase } from "./notification.firestore";

export interface Notification extends NotificationBase<Date> {
  message: string;
  imgRef?: string;
  placeholderUrl?: string;
  url?: string;
}