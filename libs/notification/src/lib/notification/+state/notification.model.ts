import { NotificationDocument } from "./notification.firestore";
import { ImgRef } from "@blockframes/utils/media";

// export type Notification = NotificationDocument;

export interface Notification extends NotificationDocument<Date> {
  message: string;
  imgRef?: ImgRef;
  placeholderUrl?: string;
  url?: string;
}

/**
 * Specific interface to load informations depending of the notification type.
 * @deprecated use Notification instead
 */
export interface  NotificationInformation {
  message: string;
  imgRef?: ImgRef;
  placeholderUrl?: string;
}
