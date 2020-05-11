import { ImgRef } from "@blockframes/utils/image-uploader";

/** A user interface with public informations */
export interface PublicUser {
  uid: string;
  email: string;
  avatar?: ImgRef;
  watermark?: ImgRef;
  firstName?: string;
  lastName?: string;
  orgId?: string;
}
