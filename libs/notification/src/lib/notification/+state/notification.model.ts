import { NotificationDocument } from "./notification.firestore";
import { HostedMedia } from "@blockframes/media/+state/media.firestore";

// export type Notification = NotificationDocument;

export interface Notification extends NotificationDocument<Date> {
  message: string;
  imgRef?: HostedMedia;
  placeholderUrl?: string;
  url?: string;
}

/**
 * Specific interface to load informations depending of the notification type.
 * @deprecated use Notification instead
 */
export interface  NotificationInformation {
  message: string;
  imgRef?: HostedMedia;
  placeholderUrl?: string;
}
