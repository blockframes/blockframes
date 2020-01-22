import { NotificationDocument } from "./notification.firestore";
import { ImgRef } from "@blockframes/utils/image-uploader";

export type Notification = NotificationDocument;

/** Specific interface to load informations depending of the notification type. */
export interface NotificationInformation {
  message: string;
  imgRef?: ImgRef;
  placeholderUrl?: string;
}
