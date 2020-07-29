import { NotificationDocument } from "./notification.firestore";

// export type Notification = NotificationDocument;

export interface Notification extends NotificationDocument<Date> {
  message: string;
  imgRef?: string;
  placeholderUrl?: string;
  url?: string;
}

/**
 * Specific interface to load information depending of the notification type.
 * @deprecated use Notification instead
 */
export interface  NotificationInformation {
  message: string;
  imgRef?: string;
  placeholderUrl?: string;
}
