import { NotificationDocument } from "./notification.firestore";
import { ImgRef } from "@blockframes/utils/image-uploader";

export interface Notification extends NotificationDocument {
  message: string;
  imgRef?: ImgRef;
  placeholderUrl?: string;
  url?: string;
}
