import { NotificationBase } from "./notification.firestore";

export interface Notification extends NotificationBase<Date> {
  message: string; // @TODO usefull #4046 ?
  imgRef?: string;
  placeholderUrl?: string;
  url?: string;
}